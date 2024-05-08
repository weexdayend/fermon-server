import kiosService from "../service/kios-service.js";
let responseSent = false;

const create = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await kiosService.create(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const createbulk = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await kiosService.createbulk(request, res);
        return result;
    } catch (e) {
        next(e);
    }
} 
const get = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await kiosService.get(request, res);
        return result;
    } catch (e) {
        next(e);
    }
} 
const getall = async (req, res, next) => {
    try {
        const result = await kiosService.getall(res);
        return result;
    } catch (e) {
        next(e);
    }
} 
const update = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await kiosService.update(request, res);
        return result;
    } catch (e) {
        next(e);
    }
} 
const remove = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await kiosService.remove(request, res);
        return result;
    } catch (e) {
        next(e);
    }
} 
const search = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await kiosService.search(request);
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
    getall,
    update,
    remove,
    search,
}
