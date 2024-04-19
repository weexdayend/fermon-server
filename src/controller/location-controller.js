import locationService from "../service/location-service.js";
let responseSent = false;
 
const location = async (req, res, next) => {
    try {
        
        await uploadService.location(req.file, res);
    } catch (e) {
        next(e);
    }
}; 
export default { 
    location, 
}
