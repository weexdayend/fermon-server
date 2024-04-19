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
    return db.alokasi.create({
        data: {
            created_at:  formattedDate,   
            tahun: request.tahun,
            bulan: request.bulan,
            nominal: request.nominal, 
            kode: request.kode, 
        },
        select: {
            id: true,  
            tahun: true,
            bulan: true,
            nominal: true, 
            kode: true, 
        }
    });
}

const get = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const alokasi = await db.alokasi.findFirst({
        where: {
            // username: user.username,
            id: id
        },
        select: {
            id: true,   
            tahun: true,
            bulan: true,
            nominal: true, 
            kode: true, 
        }
    });

    if (!alokasi) {
        // throw new ResponseError(404, "contact is not found");
        res.status(404).json({ error: 'not found' });
    }

    return alokasi;
}
const getall = async (id, res) => { 
    const alokasi = await db.alokasi.findMany({ 
        select: {
            id: true,   
            tahun: true,
            bulan: true,
            nominal: true, 
            kode: true, 
        }
    });

    // Check apakah ada data petugas
    if (alokasi.length === 0) {
        return res.status(404).json({ error: 'alokasi not found' });
    }

    
    return alokasi;
}
const update = async (request) => {
    // const contact = validate(updateContactValidation, request);

    const totalContactInDatabase = await db.alokasi.count({
        where: { 
            id: request.id
        }
    });

    if (totalContactInDatabase !== 1) {
        return res.status(404).json({ error: 'not found' });
    }

    return db.alokasi.update({
        where: {
            id: request.id
        },
        data: {
            updated_at:  formattedDate,  
            tahun: request.tahun,
            bulan: request.bulan,
            nominal: request.nominal, 
            kode: request.kode, 
        },
        select: {
            id: true,  
            tahun: true,
            bulan: true,
            nominal: true, 
            kode: true, 
        }
    })
}

const remove = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const totalInDatabase = await db.alokasi.count({
        where: {
            // username: user.username,
            id: id
        }
    });

    if (totalInDatabase !== 1) {
        // throw new ResponseError(404, "contact is not found");
        return res.status(404).json({ error: 'not found' });
    }

    return db.alokasi.delete({
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
   

    const alokasi = await db.alokasi.findMany({
        where: {
            OR: filters
        },
        take: parseInt(request.size), // Mengonversi request.size menjadi integer
        skip: skip
    });

    const totalItems = await db.alokasi.count({
        where: {
            OR: filters
        }
    });

    return {
        data: alokasi,
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
