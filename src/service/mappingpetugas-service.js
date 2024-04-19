import {db} from "../application/database.js";
import csv from "fast-csv";
import fs from "fs"; 
import path from 'path'; 
import { promisify } from 'util';
import { exec } from 'child_process'; 
const execPromisified = promisify(exec);
 
import { createDomain } from 'domain';
import delay from 'delay';
const today = new Date();
const formattedDate = today.toISOString();

const create = async (request) => { 
    return db.mapping_petugas.create({
        data: {
            created_at:  formattedDate, 
            id_petugas:  request.id_petugas,
            id_provinsi:  request.id_provinsi,
            id_kabupaten:  request.id_kabupaten,
            id_kecamatan:  request.id_kecamatan,
            id_gudang:  request.id_gudang,
            id_distributor:  request.id_distributor,
            id_kios:  request.id_kios,
            kategori:  request.kategori,
            status:  request.status, 
        },
        select: {
            id: true, 
            id_petugas: true,
            id_provinsi: true,
            id_kabupaten: true,
            id_kecamatan: true,
            id_gudang: true,
            id_distributor: true,
            id_kios: true,
            kategori: true,
            status: true,
        }
    });
}

/* const get = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const petugas = await db.mapping_petugas.findFirst({
        where: {
            // username: user.username,
            id: id
        },
        select: {
            id: true, 
            kode_petugas: true,
            nama_petugas: true,
            contact: true,
            contact_wa: true,
            jabatan: true,
            status: true,
        }
    });

    if (!petugas) {
        // throw new ResponseError(404, "contact is not found");
        res.status(404).json({ error: 'not found' });
    }

    return petugas;
} */
/* const getall = async (id) => { 

    const petugas = await db.mapping_petugas.findMany({ 
        select: {
            id: true, 
            kode_petugas: true,
            nama_petugas: true,
            contact: true,
            contact_wa: true,
            jabatan: true,
            status: true,
        }
    });

    if (!petugas) {
        // throw new ResponseError(404, "contact is not found");
        res.status(404).json({ error: 'not found' });
    }

    return petugas;
}

const update = async (request) => {
    // const contact = validate(updateContactValidation, request);

    const totalContactInDatabase = await db.petugas.count({
        where: { 
            id: request.id
        }
    });

    if (totalContactInDatabase !== 1) {
        return res.status(404).json({ error: 'not found' });
    }

    return db.petugas.update({
        where: {
            id: request.id
        },
        data: {
            updated_at:  formattedDate, 
            kode_petugas:  request.kode_petugas,
            nama_petugas:  request.nama_petugas,
            contact:  request.contact,
            contact_wa:  request.contact_wa,
            jabatan:  request.jabatan,
            status:  request.status, 
        },
        select: {
            id: true, 
            kode_petugas: true,
            nama_petugas: true,
            contact: true,
            contact_wa: true,
            jabatan: true,
            status: true,
        }
    })
}

const remove = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const totalInDatabase = await db.petugas.count({
        where: {
            // username: user.username,
            id: id
        }
    });

    if (totalInDatabase !== 1) {
        // throw new ResponseError(404, "contact is not found");
        return res.status(404).json({ error: 'not found' });
    }

    return db.petugas.delete({
        where: {
            id: id
        }
    });
}

const search = async (request) => {
    const skip = (request.page - 1) * parseInt(request.size); // Mengonversi request.size menjadi integer

    const filters = [];

    if (request.kode_petugas) {
        filters.push({
            kode_petugas: {
                contains: request.kode_petugas
            }
        });
    }

    if (request.nama_petugas) {
        filters.push({
            nama_petugas: {
                contains: request.nama_petugas
            }
        });
    }
    if (request.contact) {
        filters.push({
            contact: {
                contains: request.contact
            }
        });
    }

    const petugas = await db.petugas.findMany({
        where: {
            OR: filters
        },
        take: parseInt(request.size), // Mengonversi request.size menjadi integer
        skip: skip
    });

    const totalItems = await db.petugas.count({
        where: {
            OR: filters
        }
    });

    return {
        data: petugas,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / parseInt(request.size)) // Mengonversi request.size menjadi integer
        }
    }
} */
 
export default {
    create,
    // get,
    // getall,
    // update,
    // remove,
    // search
}
