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
    return db.harga_pupuk.create({
        data: {
            created_at:  formattedDate,  
            id_provinsi: request.id_provinsi,
            id_kabupaten: request.id_kabupaten,
            tahun: request.tahun,
            bulan: request.bulan,
            hargapupuk: request.hargapupuk, 
        },
        select: {
            id: true, 
            id_provinsi: true,
            id_kabupaten: true,
            tahun: true,
            bulan: true,
            hargapukuk: true, 
        }
    });
}

const get = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const harga_pupuk = await db.harga_pupuk.findFirst({
        where: {
            // username: user.username,
            id: id
        },
        select: {
            id: true,  
            id_provinsi: true,
            id_kabupaten: true,
            tahun: true,
            bulan: true,
            hargapukuk: true, 
        }
    });

    if (!harga_pupuk) {
        // throw new ResponseError(404, "contact is not found");
        res.status(404).json({ error: 'not found' });
    }

    return harga_pupuk;
}
const getall = async (id, res) => { 
    const harga_pupuk = await db.harga_pupuk.findMany({ 
        select: {
            id: true,  
            id_provinsi: true,
            id_kabupaten: true,
            tahun: true,
            bulan: true,
            hargapukuk: true, 
        }
    });

    // Check apakah ada data petugas
    if (harga_pupuk.length === 0) {
        return res.status(404).json({ error: 'harga_pupuk not found' });
    }

    
    return harga_pupuk;
}
const update = async (request) => {
    // const contact = validate(updateContactValidation, request);

    const totalContactInDatabase = await db.harga_pupuk.count({
        where: { 
            id: request.id
        }
    });

    if (totalContactInDatabase !== 1) {
        return res.status(404).json({ error: 'not found' });
    }

    return db.harga_pupuk.update({
        where: {
            id: request.id
        },
        data: {
            updated_at:  formattedDate, 
            id_provinsi: request.id_provinsi,
            id_kabupaten: request.id_kabupaten,
            tahun: request.tahun,
            bulan: request.bulan,
            hargapupuk: request.hargapupuk, 
        },
        select: {
            id: true, 
            id_provinsi: true,
            id_kabupaten: true,
            tahun: true,
            bulan: true,
            hargapukuk: true, 
        }
    })
}

const remove = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const totalInDatabase = await db.harga_pupuk.count({
        where: {
            // username: user.username,
            id: id
        }
    });

    if (totalInDatabase !== 1) {
        // throw new ResponseError(404, "contact is not found");
        return res.status(404).json({ error: 'not found' });
    }

    return db.harga_pupuk.delete({
        where: {
            id: id
        }
    });
}

const search = async (request) => {
    const skip = (request.page - 1) * parseInt(request.size); // Mengonversi request.size menjadi integer

    const filters = [];

    if (request.kode) {
        filters.push({
            tahun: {
                contains: request.tahun
            }
        });
    }

    if (request.bulan) {
        filters.push({
            bulan: {
                contains: request.bulan
            }
        });
    }
   

    const harga_pupuk = await db.harga_pupuk.findMany({
        where: {
            OR: filters
        },
        take: parseInt(request.size), // Mengonversi request.size menjadi integer
        skip: skip
    });

    const totalItems = await db.harga_pupuk.count({
        where: {
            OR: filters
        }
    });

    return {
        data: harga_pupuk,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / parseInt(request.size)) // Mengonversi request.size menjadi integer
        }
    }
}
 
export default {
    create,
    get,
    getall,
    update,
    remove,
    search
}
