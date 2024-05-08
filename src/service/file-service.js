import { db } from "../application/database.js";
import fs from 'fs/promises';
import path from 'path';
import { __dirname } from "../dirname.js";

/* const uploadService = {
    processUploaded: async (req, file, res) => {
        try {
            if (!file) {
                return res.status(400).json({ message: 'Invalid input. Please provide a file and tab identifier.' });
            }

            const today = new Date();
            const formattedDate = today.toISOString();
            const fileExtension = path.extname(file.originalname);

            const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
            const uniqueFileName = `${req.body.jenis_file}_file_${currentDate.replace(/\/|,|:|\s/g, '-')}${fileExtension}`;

            let uri_file = "";
            let destinationPath = "";
            if (req.body.jenis_file) {
                destinationPath = path.join(__dirname, `uploads/${req.body.jenis_file}`, uniqueFileName);
                uri_file = `/${req.body.jenis_file}/` + uniqueFileName;
            }

            const data = await fs.readFile(file.path);
            await fs.writeFile(destinationPath, data);

            const fileSize = file.size;

            const savedFile = await db.file_upload.create({
                data: {
                    created_at: formattedDate,
                    name_file: req.body.name_file,
                    file_size: fileSize.toString(),
                    uri: uri_file,
                    tahun: req.body.tahun,
                    bulan: req.body.bulan,
                    jenis_file: req.body.jenis_file,
                }
            });

            await fs.unlink(file.path);

            return res.status(200).json({ message: 'File uploaded and saved successfully!', fileName: uniqueFileName });
        } catch (error) {
            console.error('Error processing upload:', error);
            return res.status(500).json({ message: 'An error occurred while processing the upload.' });
        }
    },
}; */
const processUploaded = async (req, file, res) => {

    try {
        if (!file) {
            return res.status(400).json({ message: 'Invalid input. Please provide a file and tab identifier.' });
        }

        const today = new Date();
        const formattedDate = today.toISOString();
        const fileExtension = path.extname(file.originalname);

        const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
        const uniqueFileName = `${req.body.jenis_file}_file_${currentDate.replace(/\/|,|:|\s/g, '-')}${fileExtension}`;

        let uri_file = "";
        let destinationPath = "";
        if (req.body.jenis_file) {
            destinationPath = path.join(__dirname, `uploads/${req.body.jenis_file}`, uniqueFileName);
            uri_file = `/${req.body.jenis_file}/` + uniqueFileName;
        }

        const data = await fs.readFile(file.path);
        await fs.writeFile(destinationPath, data);

        const fileSize = file.size;

        const savedFile = await db.file_upload.create({
            data: {
                created_at: formattedDate,
                name_file: req.body.name_file,
                file_size: fileSize.toString(),
                uri: uri_file,
                tahun: req.body.tahun,
                jenis_file: req.body.jenis_file,
                keterangan: req.body.keterangan,
                kode: req.body.kode
            }
        });

        await fs.unlink(file.path);

        return res.status(200).json({ message: 'File uploaded and saved successfully!', fileName: uniqueFileName });
    } catch (error) {
        console.error('Error processing upload:', error);
        return res.status(500).json({ message: 'An error occurred while processing the upload.' });
    }
}
/* const update = async (req, file, res) => {

    try {
        if (!file) {

           
        }else{
 
            const savedFile = await db.file_upload.update({
                where: {
                    id: req.body.id
                },
                data: {
                    updated_at: formattedDate,
                    name_file: req.body.name_file,  
                    tahun: req.body.tahun,
                    bulan: req.body.bulan, 
                }
            });
     
            res.status(200).send(savedFile); 
        } 
    } catch (error) {
        console.error('Error processing upload:', error);
        return res.status(500).json({ message: 'An error occurred while processing the upload.' });
    }
} */
const updateData = async (data) => {
    try {
        // Lakukan pembaruan data tanpa file
        const savedFile = await db.file_upload.update({
            where: {
                id: data.id
            },
            data: {
                updated_at: new Date().toISOString(),
                name_file: data.name_file,
                tahun: data.tahun,
                jenis_file: data.jenis_file,
                keterangan: data.keterangan,
                kode: data.kode
            }
        });

        // Berhasil, kembalikan pesan sukses
        return { message: 'Data updated successfully!' };
    } catch (error) {
        console.error('Error updating data:', error);
        throw new Error('An error occurred while updating the data.');
    }
};
const updateWithFile = async (req, file) => {
    try {
        const today = new Date();
        const formattedDate = today.toISOString();
        const fileExtension = path.extname(file.originalname);

        const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
        const uniqueFileName = `${req.body.jenis_file}_file_${currentDate.replace(/\/|,|:|\s/g, '-')}${fileExtension}`;

        let uri_file = "";
        let destinationPath = "";
        if (req.body.jenis_file) {
            destinationPath = path.join(__dirname, `uploads/${req.body.jenis_file}`, uniqueFileName);
            uri_file = `/${req.body.jenis_file}/` + uniqueFileName;
        }

        const data = await fs.readFile(file.path);
        await fs.writeFile(destinationPath, data);

        const fileSize = file.size;

        const savedFile = await db.file_upload.update({
            where: {
                id: req.body.id
            },
            data: {
                updated_at: formattedDate,
                name_file: req.body.name_file,
                file_size: fileSize.toString(),
                uri: uri_file,
                tahun: req.body.tahun,
                keterangan: req.body.keterangan,
                kode: req.body.kode,
                jenis_file: req.body.jenis_file,
            }
        });

        await fs.unlink(file.path);

        res.status(200).json(savedFile);
    } catch (error) {
        console.error('Error processing upload:', error);
        throw new Error('An error occurred while processing the upload.');
    }
};
const get = async (request, res) => {
    const {
        tahun
    } = request; // Pastikan request telah di-parse dengan benar

    try {
        let rekonstruksiData;

        // Membuat objek untuk filter
        let wherefilter = {};
        if (tahun !== '' && tahun !== null) {
            wherefilter.tahun = kode;
        }

        await db.$transaction(async (db) => {

            rekonstruksiData = await db.file_upload.findMany({
                where: wherefilter
            });
        });

        res.status(200).send(rekonstruksiData);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`); // Menambahkan pesan kesalahan yang lebih deskriptif
    }
}
const remove = async (request, res) => {

    try {
        let updatedkios;

        await db.$transaction(async (db) => {
            const existingkios = await db.file_upload.findUnique({
                where: {
                    id: request.id
                }
            });

            if (!existingkios) {
                throw new Error('kios not found');
            }

            updatedkios = await db.file_upload.delete({
                where: {
                    id: request.id
                }
            });
        });

        res.status(200).send(updatedkios);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}
// export default uploadService;
export default {
    processUploaded,
    // update,
    updateData,
    updateWithFile,
    get,
    remove,
}
