import fileService from "../service/file-service.js";

const upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No files were uploaded.');
        }
        const request = req.body;
        const file = req.file;
        const result = await fileService.processUploaded(req, file, res);  
        // res.send("Upload success");
        return result;
    } catch (e) {
        res.send(e);
    }
};
const get = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await fileService.get(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
/* const update = async (req, res) => {
    try {
       
        const request = req.body;
        const file = req.file;
        const result = await fileService.update(req, file, res);  
 
        return result;
    } catch (e) {
        res.send(e);
    }
}; */
const update = async (req, res) => {
    try {
        const { body, file } = req;

        // Cek apakah ada file yang diunggah
        if (!file) {
            // Jika tidak ada file, lakukan pembaruan data saja
            const result = await fileService.updateData(body);
            return res.status(200).json(result);
        }

        // Jika ada file, lakukan pembaruan data dan file
        const result = await fileService.updateWithFile(req, file);  
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error during update:', error);
        return res.status(500).json({ message: 'An error occurred while processing the update.' });
    }
};
const remove = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await fileService.remove(request, res);
        return result;
    } catch (e) {
        next(e);
    }
} 
export default {
    upload,
    get,
    update,
    remove,
};
