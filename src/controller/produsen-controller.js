import produsenService from "../service/produsen-service.js";
let responseSent = false;

const create = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await produsenService.create(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const get = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await produsenService.get(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const getall = async (req, res, next) => {
    try {
        const result = await produsenService.getall(res);
        return result;
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await produsenService.update(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const remove = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await produsenService.remove(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const search = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await produsenService.search(request);
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
