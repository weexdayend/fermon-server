import areaService from "../service/area-service.js";
let responseSent = false;



const accumulation = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await areaService.accumulation(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const detail = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await areaService.detail(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const filter = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await areaService.detail(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const report = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await areaService.report(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const getarea = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await areaService.getarea(request, res);
        return result;
        // res.status(200).send("ada");
    } catch (e) {
        next(e);
    }
}
const update = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await areaService.getarea(request, res);
        return result;
        // res.status(200).send("ada");
    } catch (e) {
        next(e);
    }
}

export default {
    accumulation,
    detail,
    filter,
    report,
    getarea,
    update,
}
