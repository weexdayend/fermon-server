import informationService from "../service/information-service.js";
let responseSent = false;



const head = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await informationService.head(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const detail = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await informationService.detail(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const mapping = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await informationService.mapping(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

export default {
    head,
    detail,
    mapping,
}
