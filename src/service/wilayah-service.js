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
    return db.wilayah.create({
        data: {
            created_at:  formattedDate,  
            kode: request.kode,
            kategori: request.kategori,
            nama: request.nama,
            status: request.status, 
        },
        select: {
            id: true, 
            kode: true,
            kategori: true,
            nama: true,
            status: true, 
        }
    });
}

const get = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const wilayah = await db.wilayah.findFirst({
        where: {
            // username: user.username,
            id: id
        },
        select: {
            id: true,  
            kode: true,
            kategori: true,
            nama: true,
            status: true, 
        }
    });

    if (!wilayah) {
        // throw new ResponseError(404, "contact is not found");
        res.status(404).json({ error: 'not found' });
    }

    return wilayah;
}
const getall = async (id, res) => { 
    const wilayah = await db.wilayah.findMany({ 
        select: {
            id: true,  
            kode: true,
            kategori: true,
            nama: true,
            status: true, 
        }
    });

    // Check apakah ada data petugas
    if (wilayah.length === 0) {
        return res.status(404).json({ error: 'wilayah not found' });
    }

    
    return wilayah;
}
const update = async (request) => {
    // const contact = validate(updateContactValidation, request);

    const totalContactInDatabase = await db.wilayah.count({
        where: { 
            id: request.id
        }
    });

    if (totalContactInDatabase !== 1) {
        return res.status(404).json({ error: 'not found' });
    }

    return db.wilayah.update({
        where: {
            id: request.id
        },
        data: {
            updated_at:  formattedDate, 
            kode: request.kode,
            kategori: request.kategori,
            nama: request.nama,
            status: request.status, 
        },
        select: {
            id: true, 
            kode: true,
            kategori: true,
            nama: true,
            status: true, 
        }
    })
}

const remove = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const totalInDatabase = await db.wilayah.count({
        where: {
            // username: user.username,
            id: id
        }
    });

    if (totalInDatabase !== 1) {
        // throw new ResponseError(404, "contact is not found");
        return res.status(404).json({ error: 'not found' });
    }

    return db.wilayah.delete({
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
            kode: {
                contains: request.kode
            }
        });
    }

    if (request.kategori) {
        filters.push({
            kategori: {
                contains: request.kategori
            }
        });
    }
   

    const wilayah = await db.wilayah.findMany({
        where: {
            OR: filters
        },
        take: parseInt(request.size), // Mengonversi request.size menjadi integer
        skip: skip
    });

    const totalItems = await db.wilayah.count({
        where: {
            OR: filters
        }
    });

    return {
        data: wilayah,
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
