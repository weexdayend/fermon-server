import mappingpetugasService from "../service/mappingpetugas-service.js";
let responseSent = false;
 
const create = async (req, res, next) => {
    try { 
        const request = req.body;
        const result = await mappingpetugasService.create(request);
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e);
    }
}

/* const get = async (req, res, next) => {
    try {
        // const user = req.user;
        const id = req.body.id;
        const result = await mappingpetugasService.get(id);
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e);
    }
}

const getall = async (req, res, next) => {
    try { 
        const result = await mappingpetugasService.getall();
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
        const result = await mappingpetugasService.update(request);
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

        await mappingpetugasService.remove(id);
        res.status(200).json({
            data: "Success, Deleted petugas success"
        })
    } catch (e) {
        next(e);
    }
}
 

const search = async (req, res, next) => {
    try {
       
        const request = req.body;
        const result = await mappingpetugasService.search(request);
        res.status(200).json({
            data: result.data,
            paging: result.paging
        });
    } catch (e) {
        next(e);
    }
} */

 
export default { 
    create, 
    // get, 
    // getall, 
    // update, 
    // remove, 
    // search,  
}
