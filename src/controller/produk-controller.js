import produkService from "../service/produk-service.js";
let responseSent = false;

const create = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await produkService.create(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const get = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await produkService.get(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const getall = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await produkService.getall(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await produkService.update(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const remove = async (req, res, next) => {
    try {
        const request = req.body;

        const result = await produkService.remove(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const search = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await produkService.search(request);
        res.status(200).json({
            data: result.data,
            paging: result.paging
        });
    } catch (e) {
        next(e);
    }
}


export default {
    create,
    get,
    getall,
    update,
    remove,
    search,
}
