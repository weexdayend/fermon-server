import petugasService from "../service/petugas-service.js";
let responseSent = false;

const create = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await petugasService.create(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const createbulk = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await petugasService.createbulk(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const get = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await petugasService.get(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const getmonitoring = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await petugasService.getmonitoring(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const getall = async (req, res, next) => {
    try {
        const result = await petugasService.getall(res);
        return result;
    } catch (e) {
        next(e);
    }
}

const getmapping = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await petugasService.getmapping(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await petugasService.update(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const remove = async (req, res, next) => {
    try {
        const request = req.body;

        await petugasService.remove(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const search = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await petugasService.search(request);
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
    createbulk,
    get,
    getmonitoring,
    getall,
    getmapping,
    update,
    remove,
    search,
}
