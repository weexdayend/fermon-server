import hargapupukService from "../service/hargapupuk-service.js";
let responseSent = false;

const create = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await hargapupukService.create(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const createbulk = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await hargapupukService.createbulk(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const get = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await hargapupukService.get(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const getall = async (req, res, next) => {
    try {
        const result = await hargapupukService.getall(res);
        return result;
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await hargapupukService.update(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const remove = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await hargapupukService.remove(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

export default {
    create,
    createbulk,
    get,
    getall,
    update,
    remove,
}
