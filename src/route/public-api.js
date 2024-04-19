import express from "express";
import uploadfile from "../controller/uploadfile-controller.js"; 
import profile from "../controller/profile-controller.js"; 
import mappingprofile from "../controller/mappingprofile-controller.js"; 
import location from "../controller/location-controller.js"; 
import petugas from "../controller/petugas-controller.js"; 
import mappingpetugas from "../controller/mappingpetugas-controller.js"; 
import hargapupuk from "../controller/hargapupuk-controller.js"; 
import alokasi from "../controller/alokasi-controller.js"; 
import wilayah from "../controller/wilayah-controller.js"; 
import multer from "multer";
 
const uploads = multer({ dest: 'uploads/' });
const uploadscsv = multer({ dest: 'uploads/csv/' });

const publicRouter = new express.Router(); 
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

function socketConnectionRequest(req, res, next) {
    const headers = {
        'Access-Control-Allow-Origin': '*', // To tell client, it is allowed to access this resource from any origin
        'Cache-Control': 'no-cache', // To tell client, it is not a cacheable response
        'Content-Type': 'text/event-stream', // To tell client, it is event stream
        'Connection': 'keep-alive', // To tell client, not to close connection
    };
    res.writeHead(200, headers);
    res.write('data: Connection Established, We\'ll now start receiving messages from the server.\n')
    socket = res
    console.log('New connection established')
}

function publishMessageToConnectedSockets(data) {
    socket.write(`data: ${data}\n`);
}

publicRouter.get('/socket-connection-request', socketConnectionRequest);
publicRouter.post('/send-message-to-client', (req, res, next) => {
  const message = req.body.message;

  publishMessageToConnectedSockets('Sukses Brother!');
  res.status(200).json({ status: 'success', message: message });
});

export {
    publicRouter
}