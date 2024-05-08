import totalService from "../service/total-service.js";
 
const gettotal = async (req, res, next) => {
    try { 
        const result = await totalService.gettotal(res);
        return result;
    } catch (e) {
        next(e);
    }
}
 
 
export default { 
    gettotal, 
}
