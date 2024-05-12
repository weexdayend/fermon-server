import express from "express";
import multer from "multer";

import fs from 'fs';
import path from 'path';

import cors from "cors";

import { exec, spawn } from 'child_process';
import { db } from "../application/database.js";
import { __dirname } from "../dirname.js";

import bodyParser from 'body-parser'

import uploadfile from "../controller/uploadfile-controller.js";
import profile from "../controller/profile-controller.js";
import mappingprofile from "../controller/mappingprofile-controller.js";
// import location from "../controller/location-controller.js";
import petugas from "../controller/petugas-controller.js";
import mappingpetugas from "../controller/mappingpetugas-controller.js";
import hargapupuk from "../controller/hargapupuk-controller.js";
import alokasipenjualan from "../controller/alokasipenjualan-controller.js";
import wilayah from "../controller/wilayah-controller.js";
import filectr from "../controller/file-controller.js";
import relation from "../controller/apprelation-controller.js";
import produsen from "../controller/produsen-controller.js";
import gudang from "../controller/gudang-controller.js";
import distributor from "../controller/distributor-controller.js";
import kios from "../controller/kios-controller.js";
import produk from "../controller/produk-controller.js";
import user from "../controller/user-controller.js";
import area from "../controller/area-controller.js";
import information from "../controller/information-controller.js";
import total from "../controller/total-controller.js";

const uploads = multer({ dest: 'uploads/' });
const uploadscsv = multer({ dest: 'uploads/csv/' });
const uploaddatafile = multer({ dest: 'uploads/file/' });

const publicRouter = new express.Router();

const corsOptions = {
    origin: ['https://admin.greatjbb.com', 'https://mage.greatjbb.com', 'https://app.greatjbb.com'],
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
publicRouter.post('/upload/bulan', uploadscsv.single('file'), uploadfile.uploadbulan);


publicRouter.post('/mappingprofile', cors(corsOptions), mappingprofile.create);
publicRouter.get('/mappingprofile', cors(corsOptions), mappingprofile.get);
publicRouter.get('/mappingprofile/gudang', cors(corsOptions), mappingprofile.getallgudang);
publicRouter.put('/mappingprofile', cors(corsOptions), mappingprofile.update);
publicRouter.delete('/mappingprofile', cors(corsOptions), mappingprofile.remove);
publicRouter.get('/mappingprofile/search', cors(corsOptions), mappingprofile.search);
// publicRouter.post('/profile/mapping', mappingpetugas.create);  
// publicRouter.post('/alokasi', alokasi.create);
// publicRouter.get('/alokasi', alokasi.get);
// publicRouter.get('/alokasi/all', alokasi.getall);
// publicRouter.put('/alokasi', alokasi.update);
// publicRouter.delete('/alokasi', alokasi.remove);
// publicRouter.get('/alokasi/search', alokasi.search);  
// root api wilayah 
publicRouter.post('/wilayah/provinsi', cors(corsOptions), wilayah.getfactprovinsi);
publicRouter.put('/wilayah/provinsi', cors(corsOptions), wilayah.updategetfactprovinsi);
publicRouter.post('/wilayah/kabupaten', cors(corsOptions), wilayah.getfactkabupaten);
publicRouter.put('/wilayah/kabupaten', cors(corsOptions), wilayah.updategetfactkabupaten);
publicRouter.post('/wilayah/kecamatan', cors(corsOptions), wilayah.getfactkecamatan);
publicRouter.put('/wilayah/kecamatan', cors(corsOptions), wilayah.updategetfactkecamatan);
publicRouter.get('/wilayah/all', cors(corsOptions), cors(corsOptions), wilayah.getall);
publicRouter.put('/wilayah', cors(corsOptions), wilayah.update);
// publicRouter.get('/wilayah/search', wilayah.search);
// root api produsen
publicRouter.post('/produsen', cors(corsOptions), produsen.create);
publicRouter.post('/produsen/id', cors(corsOptions), produsen.get);
publicRouter.get('/produsen/all', cors(corsOptions), produsen.getall);
publicRouter.put('/produsen', cors(corsOptions), produsen.update);
publicRouter.delete('/produsen', cors(corsOptions), produsen.remove);
publicRouter.get('/produsen/search', produsen.search);
// root api petugas
publicRouter.post('/petugas', cors(corsOptions), petugas.create);
publicRouter.post('/petugas/bulk', cors(corsOptions), petugas.createbulk);
publicRouter.put('/petugas', cors(corsOptions), petugas.update);
publicRouter.post('/petugas/id', cors(corsOptions), petugas.get);
publicRouter.post('/monitoring/petugas', cors(corsOptions), petugas.getmonitoring);
publicRouter.post('/petugas/mapping', cors(corsOptions), mappingpetugas.create);
publicRouter.put('/petugas/mapping', cors(corsOptions), mappingpetugas.update);
publicRouter.post('/petugas/mapping/data', cors(corsOptions), mappingpetugas.get);
// publicRouter.get('/petugas/all', petugas.getall);
// publicRouter.delete('/petugas', petugas.remove);
// publicRouter.get('/petugas/search', petugas.search);
// root api produk
publicRouter.post('/admin/master/produk', cors(corsOptions), produk.create);
publicRouter.put('/admin/master/produk', cors(corsOptions), produk.update);
publicRouter.post('/admin/master/produk/data', cors(corsOptions), produk.getall);
publicRouter.delete('/admin/master/produk', cors(corsOptions), produk.remove);
// publicRouter.post('/admin/master/produk/id', produk.get);
// publicRouter.get('/admin/master/produk/search', produk.search);
//root api harga produk
publicRouter.post('/admin/master/produk/harga', cors(corsOptions), hargapupuk.create);
publicRouter.post('/admin/master/produk/harga/bulk', cors(corsOptions), hargapupuk.createbulk);
publicRouter.put('/admin/master/produk/harga', cors(corsOptions), hargapupuk.update);
publicRouter.post('/admin/master/produk/harga/data', cors(corsOptions), hargapupuk.get);
// publicRouter.get('/admin/master/produk/harga/data', cors(corsOptions), hargapupuk.getall);
publicRouter.delete('/admin/master/produk/harga', cors(corsOptions), hargapupuk.remove);
// publicRouter.post('/admin/master/produk/harga/id', hargapupuk.get);
// publicRouter.get('/admin/master/hargaproduk/search', hargapupuk.search);
// root api gudang 
publicRouter.post('/gudang', cors(corsOptions), gudang.create);
publicRouter.post('/gudang/file', cors(corsOptions), upload.single('file'), gudang.upload);
publicRouter.post('/gudang/bulk', cors(corsOptions), gudang.createbulk);
publicRouter.put('/gudang', cors(corsOptions), gudang.update);
publicRouter.post('/gudang/id', cors(corsOptions), gudang.get);
// publicRouter.get('/gudang/all', gudang.getall);
// publicRouter.post('/gudang/produsen', gudang.getprodusen);
// publicRouter.post('/gudang/distributor', gudang.getdistributor);
// publicRouter.delete('/gudang', gudang.remove);
// publicRouter.get('/gudang/search', gudang.search);
// root api distributor 
publicRouter.post('/distributor', cors(corsOptions), distributor.create);
publicRouter.post('/distributor/bulk', cors(corsOptions), distributor.createbulk);
publicRouter.put('/distributor', cors(corsOptions), distributor.update);
publicRouter.post('/distributor/id', cors(corsOptions), distributor.get);
// publicRouter.delete('/distributor', distributor.remove);
// publicRouter.get('/distributor/all', distributor.getall);
// publicRouter.post('/distributor/kios', distributor.getkios);
// publicRouter.get('/distributor/search', distributor.search); 
// root api kios
publicRouter.post('/kios', cors(corsOptions), kios.create);
publicRouter.post('/kios/bulk', cors(corsOptions), kios.createbulk);
publicRouter.put('/kios', cors(corsOptions), kios.update);
publicRouter.post('/kios/id', cors(corsOptions), kios.get);
// publicRouter.get('/kios/all', kios.getall);
// publicRouter.delete('/kios', kios.remove);
// publicRouter.get('/kios/search', kios.search);
// root api user
publicRouter.post('/login', cors(corsOptions), user.login_user);
publicRouter.post('/register', cors(corsOptions), user.create);
publicRouter.post('/user/log', cors(corsOptions), user.createlog);
publicRouter.put('/user', cors(corsOptions), user.update);
publicRouter.post('/user', cors(corsOptions), user.get);
publicRouter.get('/user/all', cors(corsOptions), user.getall);
//root api profile
publicRouter.post('/profile', cors(corsOptions), profile.create);
publicRouter.get('/profile', cors(corsOptions), profile.get);
publicRouter.get('/profile/all', cors(corsOptions), profile.getall);
publicRouter.put('/profile', cors(corsOptions), profile.update);
publicRouter.delete('/profile', cors(corsOptions), profile.remove);
publicRouter.get('/profile/search', cors(corsOptions), profile.search);
//root api alokasi penjualan
publicRouter.post('/admin/alokasi', cors(corsOptions), alokasipenjualan.create);
publicRouter.post('/admin/alokasi/bulk', cors(corsOptions), alokasipenjualan.createbulk);
publicRouter.put('/admin/alokasi', cors(corsOptions), alokasipenjualan.update);
publicRouter.post('/admin/alokasi/distributor', cors(corsOptions), alokasipenjualan.getalldistributors);
// publicRouter.get('/admin/alokasi/distributors', alokasipenjualan.getalldistributors); 

publicRouter.post('/monitoring/alokasi/distributor/sum', cors(corsOptions), alokasipenjualan.getalldistributorsum);
publicRouter.post('/monitoring/alokasi/wilayah/sum', cors(corsOptions), alokasipenjualan.getsumwilayah);
publicRouter.post('/monitoring/alokasi/besaran/sum', cors(corsOptions), alokasipenjualan.getsumwtebusjual);

// publicRouter.post('/admin/alokasipenjualan/id', alokasipenjualan.get);
// publicRouter.get('/admin/alokasipenjualan/all', alokasipenjualan.getall);
// publicRouter.delete('/admin/alokasipenjualan', alokasipenjualan.remove);
// publicRouter.get('/alokasipenjualan/search', alokasipenjualan.search);
// root mapping area
publicRouter.post('/mapping/area', cors(corsOptions), area.getarea);
publicRouter.put('/mapping/area', cors(corsOptions), area.update);
// root api area
publicRouter.post('/area/accumulation', cors(corsOptions), area.accumulation);
publicRouter.post('/area/detail', cors(corsOptions), area.detail);
publicRouter.post('/area/filter', cors(corsOptions), area.filter);
publicRouter.post('/area/report', cors(corsOptions), area.report);
// root api information
publicRouter.post('/information/head', cors(corsOptions), information.head);
publicRouter.post('/information/detail', cors(corsOptions), information.detail);
publicRouter.post('/mapping', cors(corsOptions), information.mapping);
// application list
publicRouter.post('/app-relation', cors(corsOptions), relation.create);
publicRouter.put('/app-relation', cors(corsOptions), relation.update);
publicRouter.get('/total', cors(corsOptions), total.gettotal);
//root api list file 
publicRouter.post('/file', upload.single('file'), filectr.upload);
publicRouter.put('/file', upload.single('file'), filectr.update);
publicRouter.delete('/file', upload.single('file'), filectr.remove);
publicRouter.post('/file/data', filectr.get);

publicRouter.get('/app-relation', cors(corsOptions), async (req, res) => {
    try {
        const result = await db.$transaction(async (tx) => {
            return await tx.application_relation.findMany()
        })

        res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ error: 'Internal server error' });
    }
})
publicRouter.get('/app-checkup', cors(corsOptions), async (req, res) => {
    try {
        const result = await db.$transaction(async (tx) => {
            const checkup = await tx.application_status.findMany({
                select: {
                    status_code: true,
                    last_checked: true,
                    time_taken: true,
                    application: true
                }
            })

            const reformattedCheckup = checkup.map(item => ({
                status_code: item.status_code,
                last_checked: item.last_checked,
                time_taken: item.time_taken,
                app_name: item.application.app_name,
            }));

            return reformattedCheckup
        })

        res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ error: 'Internal server error' });
    }
})
publicRouter.post('/migrate', cors(corsOptions), async (req, res) => {
    const { tabIdentifier, grant_access } = req.body;
    const grant_access_str = grant_access.toString();

    if (tabIdentifier !== 'f5' && tabIdentifier !== 'f6') {
        return res.status(400).json({ error: 'Invalid tabIdentifier' });
    }

    try {
        spawn('/usr/bin/python3', ['src/service/migrate.py', tabIdentifier, grant_access_str]);
        res.status(200).json({ message: grant_access_str });
    } catch (error) {
        console.error('Error during migration:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})
publicRouter.post('/bulk', cors(corsOptions), upload.single('file'), async (req, res) => {
    const { tabIdentifier } = req.body;

    if (!req.file || !req.body.tabIdentifier) {
        return res.status(400).json({ message: 'Invalid input. Please provide a file and tab identifier.' });
    }

    try {
        const pythonScript = spawn('/usr/bin/python3', ['src/python/import-bulk.py', req.file.path, tabIdentifier]);

        pythonScript.stdout.on('data', (data) => {
            const response = data.toString();
            const matches = response.match(/Total batches successfully inserted: (\d+)\nTotal rows: (\d+)/);

            console.log(`stdout: ${matches}`);
        });

        pythonScript.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        let exitCode;

        pythonScript.on('close', (code) => {
            exitCode = code;
            console.log('conn close', code);

            // Pastikan Anda hanya mengirim tanggapan jika belum dikirim sebelumnya
            if (!res.headersSent) {
                res.send(`File uploaded and data imported successfully. Time taken: ${exitCode} seconds.`);
            }
        });
        res.status(200).json({ message: 'Import bulk data.' });
    } catch (error) {
        console.error('Error during migration:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})
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

publicRouter.get('/file/document/:directoryName/:fileName', cors(corsOptions), (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads');
    const { directoryName, fileName } = req.params;
    const filePath = path.join(directoryPath, directoryName, fileName);

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(err.status).end();
        } else {
            console.log('File sent successfully:', filePath);
        }
    });
})
/* publicRouter.post('/migrate', cors(corsOptions), async(req, res) => {
    const { tabIdentifier } = req.body;

    if (tabIdentifier !== 'f5' && tabIdentifier !== 'f6') {
        return res.status(400).json({ error: 'Invalid tabIdentifier' });
    }

    try {

        // Begin a transaction
        await db.$transaction(async (tx) => {
            // Fetch data based on tabIdentifier
            let tmpData;
            if (tabIdentifier === 'f5') {
                tmpData = await tx.tmp_dwh_f5_.findMany();
            } else {
                tmpData = await tx.tmp_dwh_f6_.findMany();
            }

            // Insert all records into datawarehouse_f5 or datawarehouse_f6 based on tabIdentifier
            await tx[`datawarehouse_${tabIdentifier}`].createMany({
                data: tmpData,
            });
        });

        await db.$transaction(async (tx) => {
            // Delete all records from _tmp_dwh_f5_ or _tmp_dwh_f6_ based on tabIdentifier
            await tx[`tmp_dwh_${tabIdentifier}_`].deleteMany();
        })

        console.log('Migration successful');
        return res.status(200).json({ message: 'Migration successful' });
    } catch (error) {
        console.error('Error during migration:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
})  */
export {
    publicRouter
}