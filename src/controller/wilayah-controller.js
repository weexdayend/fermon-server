import wilayahService from "../service/wilayah-service.js";
let responseSent = false;
 
const create = async (req, res, next) => {
    try { 
        const request = req.body;
        const result = await wilayahService.create(request);
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e);
    }
}

const get = async (req, res, next) => {
    try { 
        const id = req.body.id;
        const result = await wilayahService.get(id);
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e);
    }
}

const getall = async (req, res, next) => {
    try { 
        const result = await wilayahService.getall();
        res.status(200).json({
            data: result
        })
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try { 
        const request = req.body;
        const result = await wilayahService.update(request);
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

        await wilayahService.remove(id);
        res.status(200).json({
            data: "Success, Deleted wilayah success"
        })
    } catch (e) {
        next(e);
    }
}
 

const search = async (req, res, next) => {
    try {
       
        const request = req.body;
        const result = await wilayahService.search(request);
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
