import uploadService from "../service/upload-service.js";
let responseSent = false;
const upload = async (req, res, next) => {
    try {
        // Memeriksa jika ada file yang diunggah
        if (!req.file) {
            return res.status(400).send('No files were uploaded.');
        }

        // Panggil layanan untuk melakukan tugas-tugas terkait unggahan file
        const result = await uploadService.processUploadedFile(req.file);

        // Kirim respons ke klien bahwa unggahan berhasil
        res.send("Upload success");
    } catch (e) {
        // Tangani kesalahan dengan meneruskannya ke middleware error handling
        next(e);
    }
}
/* const uploadtebus = async (req, res, next) => {
    try {
        // Memeriksa jika ada file yang diunggah
        if (!req.file) {
            return res.status(400).send('No files were uploaded.');
        }

        // Panggil layanan untuk melakukan tugas-tugas terkait unggahan file
        const result = await uploadService.processUploadedFileTebus(req.file);

        // Kirim respons ke klien bahwa unggahan berhasil
        res.send("Upload success");
    } catch (e) {
        // Tangani kesalahan dengan meneruskannya ke middleware error handling
        next(e);
    }
} */
const uploadsalur = async (req, res, next) => {
   /*  try {
        // Memeriksa jika ada file yang diunggah
        if (!req.file) {
            return res.status(400).send('No files were uploaded.');
        }

        // Panggil layanan untuk melakukan tugas-tugas terkait unggahan file
        const result = await uploadService.processUploadedFileSalur(req.file);

        // Kirim respons ke klien bahwa unggahan berhasil
        res.send("Upload success");
    } catch (e) {
        // Tangani kesalahan dengan meneruskannya ke middleware error handling
        next(e);
    } */
    try {
        if (!req.file) {
            return res.status(400).send('No files were uploaded.');
        } 
        await uploadService.processUploadedFileSalur(req.file, res);
    } catch (e) {
        next(e);
    }
}
const uploadtebus = async (req, res, next) => {
 
     try {
         if (!req.file) {
             return res.status(400).send('No files were uploaded.');
         } 
         await uploadService.processUploadedFileTebus(req.file, res);
     } catch (e) {
         next(e);
     }
 }
const uploadbulanf5 = async (req, res, next) => {
    try { 
        if (!req.file) {
            return res.status(400).send('No files were uploaded.');
        } 
        const result = await uploadService.processUploadedFileBulanF5(req.file); 
        res.send("Upload success");
    } catch (e) { 
        next(e);
    }
} 
const uploadbulanf6 = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).send('No files were uploaded.');
        } 
        await uploadService.processUploadedFileBulanF6(req.file, res);
    } catch (e) {
        next(e);
    }
};  
export default {
    upload,
    uploadtebus,
    uploadsalur,
    uploadbulanf5,
    uploadbulanf6, 
}
