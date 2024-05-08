import distributorService from "../service/distributor-service.js";
let responseSent = false;

const create = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await distributorService.create(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const createbulk = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await distributorService.createbulk(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const get = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await distributorService.get(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const getkios = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await distributorService.getkios(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const getall = async (req, res, next) => {
    try {
        const result = await distributorService.getall(res);
        return result;
    } catch (e) {
        next(e);
    }
}
 
const update = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await distributorService.update(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
  
const remove = async (req, res, next) => {
    try {
        const request = req.body;

        const result = await distributorService.remove(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
 
export default {
    create,
    createbulk,
    get,
    getkios,
    getall,
    update,
    remove,
    // getalldistributor, 
    // getalldistributorsum,
    // getsumwilayah,  
}
