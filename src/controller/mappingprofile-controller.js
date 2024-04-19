import mappingprofileService from "../service/mappingprofile-service.js";
let responseSent = false;
 
const create = async (req, res, next) => {
    try { 
        const request = req.body;
        const result = await mappingprofileService.create(request);
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e);
    }
}

const get = async (req, res, next) => {
    try {
        // const user = req.user;
        const id = req.body.id;
        const result = await mappingprofileService.get(id);
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e);
    }
}

const getallgudang = async (req, res, next) => {
    try { 
        const request = req.body;
        const result = await mappingprofileService.getallgudang(request);
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try {
        // const user = req.user;
        // const contactId = req.params.contactId;
        // const request = req.body;
        // request.id = contactId;
        const request = req.body;
        const result = await mappingprofileService.update(request);
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e);
    }
} 

const remove = async (req, res, next) => {
    try {
        // const user = req.user;
        const id = req.body.id;

        await mappingprofileService.remove(id);
        res.status(200).json({
            data: "Success, Deleted mappingprofile success"
        })
    } catch (e) {
        next(e);
    }
}
 

const search = async (req, res, next) => {
    try {
       
        const request = req.body;
        const result = await mappingprofileService.search(request);
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
    getallgudang, 
    update, 
    remove, 
    search,  
}
