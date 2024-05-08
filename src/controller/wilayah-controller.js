import wilayahService from "../service/wilayah-service.js";
let responseSent = false;

const create = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await wilayahService.create(request);
        res.status(200).json({ result })
    } catch (e) {
        next(e);
    }
}

const get = async (req, res, next) => {
    try {
        const request = req.body.id;
        const result = await wilayahService.get(request);
        return result;
    } catch (e) {
        next(e);
    }
}
const getprovinsi = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await wilayahService.getprovinsi(request, res);
        // res.status(200).json({ result })
        return result;
    } catch (e) {
        next(e);
    }
}
const getfactprovinsi = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await wilayahService.getfactprovinsi(request, res);
        // res.status(200).json({ result })
        return result;
    } catch (e) {
        next(e);
    }
}
const getkabupaten = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await wilayahService.getkabupaten(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const getfactkabupaten = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await wilayahService.getfactkabupaten(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const getkecamatan = async (req, res, next) => {
    // try {
    //     // const request = req.body;
    //     const result = await wilayahService.getkecamatan();
    //     res.status(200).json({ result })
    // } catch (e) {
    //     next(e);
    // }
    try {
        const request = req.body;
        const result = await wilayahService.getkecamatan(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}
const getfactkecamatan = async (req, res, next) => {
 
    try {
        const request = req.body;
        const result = await wilayahService.getfactkecamatan(request, res);
        return result;
    } catch (e) {
        next(e);
    }
}

const getall = async (req, res, next) => {
    try {
        const result = await wilayahService.getall(res);
        return result;
    } catch (e) {
        next(e);
    }
}

const update = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await wilayahService.update(request);
        res.status(200).json({ result })
    } catch (e) {
        next(e);
    }
}
const updategetfactprovinsi = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await wilayahService.updategetfactprovinsi(request, res);
        // res.status(200).json({ result })
        return result;
    } catch (e) {
        next(e);
    }
}
const updategetfactkabupaten = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await wilayahService.updategetfactkabupaten(request, res);
        // res.status(200).json({ result })
        return result;
    } catch (e) {
        next(e);
    }
}
const updategetfactkecamatan = async (req, res, next) => {
    try {
        const request = req.body;
        const result = await wilayahService.updategetfactkecamatan(request, res);
        // res.status(200).json({ result })
        return result;
    } catch (e) {
        next(e);
    }
}
// const search = async (req, res, next) => {
//     try {

//         const request = req.body;
//         const result = await wilayahService.search(request);
//         res.status(200).json({
//             data: result.data,
//             paging: result.paging
//         });
//     } catch (e) {
//         next(e);
//     }
// }

export default {
    create,
    get,
    getprovinsi,
    getfactprovinsi,    
    updategetfactprovinsi,    
    getkabupaten,
    getfactkabupaten,
    updategetfactkabupaten,
    getkecamatan,
    getfactkecamatan,
    updategetfactkecamatan,
    getall,
    update,
    // search,
}
