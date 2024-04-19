import alokasiService from "../service/alokasi-service.js";
let responseSent = false;
 
const create = async (req, res, next) => {
    try { 
        const request = req.body;
        const result = await alokasiService.create(request);
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
        const result = await alokasiService.get(id);
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e);
    }
}

const getall = async (req, res, next) => {
    try { 
        const result = await alokasiService.getall();
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
        const result = await alokasiService.update(request);
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

        await alokasiService.remove(id);
        res.status(200).json({
            data: "Success, Deleted alokasi success"
        })
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
    get, 
    getall, 
    update, 
    remove, 
    search,  
}
