import express from "express";
import multer from "multer";

import fs from 'fs';
import path from 'path';

import cors from "cors";

import { db } from "../application/database.js";
import { __dirname } from "../dirname.js";

import bodyParser from 'body-parser'

import uploadfile from "../controller/uploadfile-controller.js";
import profile from "../controller/profile-controller.js";
import mappingprofile from "../controller/mappingprofile-controller.js";
import location from "../controller/location-controller.js";
import petugas from "../controller/petugas-controller.js";
import mappingpetugas from "../controller/mappingpetugas-controller.js";
import hargapupuk from "../controller/hargapupuk-controller.js";
import alokasi from "../controller/alokasi-controller.js";
import wilayah from "../controller/wilayah-controller.js";

const uploads = multer({ dest: 'uploads/' });
const uploadscsv = multer({ dest: 'uploads/csv/' });

const publicRouter = new express.Router();

const corsOptions = {
    origin: ['https://admin.synchronice.id', 'https://mage.synchronice.id'],
    optionsSuccessStatus: 200
};

publicRouter.use(cors(corsOptions))

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 100 * 1024 * 1024 } // 100 MB
});

// Increase the request size limit
publicRouter.use(bodyParser.json({ limit: '100mb' }));
publicRouter.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

publicRouter.post('/upload', uploads.single('file'), uploadfile.upload);
publicRouter.post('/upload/harian/salur', uploadscsv.single('file'), uploadfile.uploadsalur);
publicRouter.post('/upload/harian/tebus', uploadscsv.single('file'), uploadfile.uploadtebus);
publicRouter.post('/upload/bulan/f5', uploadscsv.single('file'), uploadfile.uploadbulanf5);
publicRouter.post('/upload/bulan/f6', uploadscsv.single('file'), uploadfile.uploadbulanf6);
publicRouter.post('/profile', profile.create);
publicRouter.get('/profile', profile.get);
publicRouter.get('/profile/all', profile.getall);
publicRouter.put('/profile', profile.update);
publicRouter.delete('/profile', profile.remove);
publicRouter.get('/profile/search', profile.search);

publicRouter.post('/mappingprofile', mappingprofile.create);
publicRouter.get('/mappingprofile', mappingprofile.get);
publicRouter.get('/mappingprofile/gudang', mappingprofile.getallgudang);
publicRouter.put('/mappingprofile', mappingprofile.update);
publicRouter.delete('/mappingprofile', mappingprofile.remove);
publicRouter.get('/mappingprofile/search', mappingprofile.search);
// publicRouter.post('/profile/mapping', mappingpetugas.create); 

publicRouter.post('/petugas', petugas.create);
publicRouter.get('/petugas', petugas.get);
publicRouter.get('/petugas/all', petugas.getall);
publicRouter.put('/petugas', petugas.update);
publicRouter.delete('/petugas', petugas.remove);
publicRouter.get('/petugas/search', petugas.search);
publicRouter.post('/petugas/mapping', mappingpetugas.create);

publicRouter.post('/hargapupuk', hargapupuk.create);
publicRouter.get('/hargapupuk', hargapupuk.get);
publicRouter.get('/hargapupuk/all', hargapupuk.getall);
publicRouter.put('/hargapupuk', hargapupuk.update);
publicRouter.delete('/hargapupuk', hargapupuk.remove);
publicRouter.get('/hargapupuk/search', hargapupuk.search);

publicRouter.post('/alokasi', alokasi.create);
publicRouter.get('/alokasi', alokasi.get);
publicRouter.get('/alokasi/all', alokasi.getall);
publicRouter.put('/alokasi', alokasi.update);
publicRouter.delete('/alokasi', alokasi.remove);
publicRouter.get('/alokasi/search', alokasi.search);

publicRouter.post('/alokasi', alokasi.create);
publicRouter.get('/alokasi', alokasi.get);
publicRouter.get('/alokasi/all', alokasi.getall);
publicRouter.put('/alokasi', alokasi.update);
publicRouter.delete('/alokasi', alokasi.remove);
publicRouter.get('/alokasi/search', alokasi.search);

publicRouter.post('/wilayah', wilayah.create);
publicRouter.get('/wilayah', wilayah.get);
publicRouter.get('/wilayah/all', wilayah.getall);
publicRouter.put('/wilayah', wilayah.update);
publicRouter.delete('/wilayah', wilayah.remove);
publicRouter.get('/wilayah/search', wilayah.search);


publicRouter.post('/upload-file', cors(corsOptions), upload.single('file'), async (req, res) => {
    try {
        // Validasi input
        if (!req.file || !req.body.tabIdentifier) {
            return res.status(400).json({ message: 'Invalid input. Please provide a file and tab identifier.' });
        }

        const today = new Date();
        const formattedDate = today.toISOString();
        // Extract file extension
        const fileExtension = path.extname(req.file.originalname);

        // Generate unique filename with tab identifier and current date and time
        const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
        const uniqueFileName = `${req.body.tabIdentifier}_file_${currentDate.replace(/\/|,|:|\s/g, '-')}${fileExtension}`;

        // Define the destination path
        const destinationPath = path.join(__dirname, 'uploads', uniqueFileName);

        // Read the uploaded file and save it with the new name
        fs.readFile(req.file.path, async (err, data) => {
            if (err) {
                return res.status(400).json({ message: 'Error reading the uploaded file.' });
            }

            // Write the file to the destination path
            fs.writeFile(destinationPath, data, async (err) => {
                if (err) {
                    return res.status(400).json({ message: 'Error saving the file.' });
                }

                // Get file size
                const fileSize = req.file.size;

                try {
                    // Save file details to the database using Prisma
                    const savedFile = await db.file_upload.create({
                        data: {
                            file_name: uniqueFileName,
                            file_size: fileSize.toString(), // Convert to string
                            uri: "/get-file/" + uniqueFileName, // Assuming you want to save the file path
                            upload_at: formattedDate
                        }
                    });
                    console.log('File details saved:', savedFile);
                } catch (error) {
                    console.error('Error saving file details to database:', error);
                    return res.status(500).json({ message: 'Error saving file details to database.' });
                }

                // Remove the temporary file
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error('Error deleting the temporary file:', err);
                    }
                });

                return res.status(200).json({ message: 'File uploaded and saved successfully!', fileName: uniqueFileName });
            });
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

// Endpoint untuk mengambil file
publicRouter.get('/get-file/:fileName', cors(corsOptions), (req, res) => {
    try {
        const { fileName } = req.params;
        const filePath = path.join(__dirname, 'uploads', fileName);

        // Check if the file exists
        if (fs.existsSync(filePath)) {
            // Read the file content
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return res.status(500).json({ message: 'Error reading file.' });
                }

                // Set the content type to text/csv
                res.setHeader('Content-Type', 'text/csv');

                // Send the file content as the response
                res.status(200).send(data);
            });
        } else {
            res.status(404).json({ message: 'File not found.' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export {
    publicRouter
}