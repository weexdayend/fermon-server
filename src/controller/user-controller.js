import userService from "../service/user-service.js";
let responseSent = false;

const create = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await userService.create(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const gantipassword = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await userService.gantipassword(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const createlog = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await userService.createlog(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const login_user = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await userService.login_user(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const get = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await userService.get(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const getall = async (req, res, next) => {
    try {
        const result = await userService.getall();
        res.status(200).json(result)
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await userService.update(request);
        res.status(200).json(result)
    } catch (e) {
        next(e);
    }
}

const remove = async (req, res, next) => {
    try {
        // const user = req.user;
        const id = req.body.id;

        await userService.remove(id);
        res.status(200).json({
            data: "Success, Deleted user success"
        })
    } catch (e) {
        next(e);
    }
}

const search = async (req, res, next) => {
    try {

        const request = req.body;
        const result = await userService.search(request);
        res.status(200).json({
            data: result.data,
            paging: result.paging
        });
    } catch (e) {
        next(e);
    }
}


export default {
    login_user,
    create,
    gantipassword,
    createlog,
    get,
    getall,
    update,
    remove,
    search,
}
