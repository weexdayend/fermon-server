import alokasiService from "../service/alokasipenjualan-service.js";
let responseSent = false;

const create = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await alokasiService.create(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const createbulk = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await alokasiService.createbulk(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await alokasiService.update(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const remove = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await alokasiService.remove(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const get = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await alokasiService.get(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const getalldistributor = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await alokasiService.getalldistributor(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const getalldistributors = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await alokasiService.getalldistributors(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const getalldistributorsum = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await alokasiService.getalldistributorsum(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const getsumwilayah = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await alokasiService.getsumwilayah(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const getsumwilayahf5 = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await alokasiService.getsumwilayahf5(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const getsumwilayahf6 = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await alokasiService.getsumwilayahf6(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const getsumwtebusjual = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await alokasiService.getsumwtebusjual(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const getall = async (req, res, next) => {
    try {
        const result = await alokasiService.getall(res);
        return result;
    } catch (e) {
        next(e);
    }
}

const search = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await alokasiService.search(request);
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
    getalldistributor,
    getalldistributors,
    getalldistributorsum,
    getsumwilayah,
    getsumwilayahf5,
    getsumwilayahf6,
    getsumwtebusjual,
    get,
    getall,
    update,
    remove,
    search,
}
