import express from "express";
import multer from "multer";

import fs from 'fs';
import path from 'path';

import cors from "cors";

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
    origin: 'https://admin.synchronice.id',
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

publicRouter.post('/api/upload', uploads.single('file'), uploadfile.upload); 
// publicRouter.post('/api/upload/harian/tebus', uploads.single('file'), uploadfile.uploadtebus); 
// publicRouter.post('/api/upload/harian/salur', uploads.single('file'), uploadfile.uploadsalur); 
publicRouter.post('/api/upload/harian/salur', uploadscsv.single('file'), uploadfile.uploadsalur);  
publicRouter.post('/api/upload/harian/tebus', uploadscsv.single('file'), uploadfile.uploadtebus);  
publicRouter.post('/api/upload/bulan/f5', uploadscsv.single('file'), uploadfile.uploadbulanf5); 
publicRouter.post('/api/upload/bulan/f6', uploadscsv.single('file'), uploadfile.uploadbulanf6); 
// publicRouter.get('/api/profile', profile.profile); 
// publicRouter.get('/api/location', location.location); 
publicRouter.post('/api/profile', profile.create); 
publicRouter.get('/api/profile', profile.get);
publicRouter.get('/api/profile/all', profile.getall);
publicRouter.put('/api/profile', profile.update);
publicRouter.delete('/api/profile', profile.remove);
publicRouter.get('/api/profile/search', profile.search);

publicRouter.post('/api/mappingprofile', mappingprofile.create); 
publicRouter.get('/api/mappingprofile', mappingprofile.get);
publicRouter.get('/api/mappingprofile/gudang', mappingprofile.getallgudang);
publicRouter.put('/api/mappingprofile', mappingprofile.update);
publicRouter.delete('/api/mappingprofile', mappingprofile.remove);
publicRouter.get('/api/mappingprofile/search', mappingprofile.search);
// publicRouter.post('/api/profile/mapping', mappingpetugas.create); 

publicRouter.post('/api/petugas', petugas.create); 
publicRouter.get('/api/petugas', petugas.get);
publicRouter.get('/api/petugas/all', petugas.getall);
publicRouter.put('/api/petugas', petugas.update);
publicRouter.delete('/api/petugas', petugas.remove);
publicRouter.get('/api/petugas/search', petugas.search);
publicRouter.post('/api/petugas/mapping', mappingpetugas.create); 
 
publicRouter.post('/api/hargapupuk', hargapupuk.create); 
publicRouter.get('/api/hargapupuk', hargapupuk.get);
publicRouter.get('/api/hargapupuk/all', hargapupuk.getall);
publicRouter.put('/api/hargapupuk', hargapupuk.update);
publicRouter.delete('/api/hargapupuk', hargapupuk.remove);
publicRouter.get('/api/hargapupuk/search', hargapupuk.search);

publicRouter.post('/api/alokasi', alokasi.create); 
publicRouter.get('/api/alokasi', alokasi.get);
publicRouter.get('/api/alokasi/all', alokasi.getall);
publicRouter.put('/api/alokasi', alokasi.update);
publicRouter.delete('/api/alokasi', alokasi.remove);
publicRouter.get('/api/alokasi/search', alokasi.search);


publicRouter.post('/api/alokasi', alokasi.create); 
publicRouter.get('/api/alokasi', alokasi.get);
publicRouter.get('/api/alokasi/all', alokasi.getall);
publicRouter.put('/api/alokasi', alokasi.update);
publicRouter.delete('/api/alokasi', alokasi.remove);
publicRouter.get('/api/alokasi/search', alokasi.search);

publicRouter.post('/api/wilayah', wilayah.create); 
publicRouter.get('/api/wilayah', wilayah.get);
publicRouter.get('/api/wilayah/all', wilayah.getall);
publicRouter.put('/api/wilayah', wilayah.update);
publicRouter.delete('/api/wilayah', wilayah.remove);
publicRouter.get('/api/wilayah/search', wilayah.search);

publicRouter.post('/upload-file', cors(corsOptions), upload.single('file'), (req, res) => {
    try {
      if (!req.file || !req.body.tabIdentifier) {
        return res.status(400).json({ message: 'No file or tab identifier uploaded.' });
      }
  
      // Extract file extension
      const fileExtension = path.extname(req.file.originalname);
  
      // Generate unique filename with tab identifier and current date and time
      const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
      const uniqueFileName = `${req.body.tabIdentifier}_file_${currentDate.replace(/\/|,|:|\s/g, '-')}${fileExtension}`;
  
      // Define the destination path
      const destinationPath = path.join(__dirname, 'uploads', uniqueFileName);
  
      // Read the uploaded file and save it with the new name
      fs.readFile(req.file.path, (err, data) => {
        if (err) {
          return res.status(400).json({ message: 'Error reading the uploaded file.' });
        }
  
        // Write the file to the destination path
        fs.writeFile(destinationPath, data, (err) => {
          if (err) {
            return res.status(400).json({ message: 'Error saving the file.' });
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


export {
    publicRouter
}