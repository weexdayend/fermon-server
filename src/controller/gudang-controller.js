import gudangService from "../service/gudang-service.js";
let responseSent = false;

const create = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await gudangService.create(request, res);
        // res.status(200).json({ result })
        return result;
    } catch (e) {
        next(e);
    }
}
const createbulk = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await gudangService.createbulk(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const get = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await gudangService.get(request, res);
        // res.status(200).json({ result })
        return result;
    } catch (e) {
        next(e);
    }
}

const getall = async (req, res, next) => {
    try {
        const result = await gudangService.getall(res);
        return result;
    } catch (e) {
        next(e);
    }
}

const getprodusen = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await gudangService.getprodusen(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const getdistributor = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await gudangService.getdistributor(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await gudangService.update(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const remove = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await gudangService.remove(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const search = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await gudangService.search(request);
        res.status(200).json({
            data: result.data,
            paging: result.paging
        });
    } catch (e) {
        next(e);
    }
}
const upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No files were uploaded.');
        }
        const request = req.body;
        const file = req.file;
        const result = await gudangService.upload(req, file, res);
        return result;
    } catch (e) {
        res.send(e);
    }
};

export default {
    create,
    createbulk,
    get,
    getall,
    getprodusen,
    getdistributor,
    update,
    remove,
    search,
    upload,
}
