import relationService from "../service/apprelation-service.js";
let responseSent = false;

const create = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await relationService.create(request);
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
        const result = await relationService.update(request);
        res.status(200).json(result)
    } catch (e) {
        next(e);
    }
}

const remove = async (req, res, next) => {
    try {
        // const user = req.user;
        const id = req.body.id;

        await relationService.remove(id);
        res.status(200).json({
            data: "Success, Deleted alokasi success"
        })
    } catch (e) {
        next(e);
    }
}




export default {
    create,
    update,
    remove,

}
