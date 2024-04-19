import profileService from "../service/profile-service.js";
let responseSent = false;
 
const create = async (req, res, next) => {
    try { 
        const request = req.body;
        const result = await profileService.create(request);
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
        const result = await profileService.get(id);
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e);
    }
}

const getall = async (req, res, next) => {
    try { 
        const result = await profileService.getall();
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
        const result = await profileService.update(request);
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

        await profileService.remove(id);
        res.status(200).json({
            data: "Success, Deleted profile success"
        })
    } catch (e) {
        next(e);
    }
}
 

const search = async (req, res, next) => {
    try {
       
        const request = req.body;
        const result = await profileService.search(request);
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
    getall, 
    update, 
    remove, 
    search,  
}
