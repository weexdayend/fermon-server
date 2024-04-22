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
    return db.mapping_profile.create({
        data: {
            created_at:  formattedDate, 
            id_provinsi:  request.id_provinsi,
            id_kabupaten:  request.id_kabupaten,
            id_kecamatan:  request.id_kecamatan,
            id_gudang:  request.id_gudang,
            id_distributor:  request.id_distributor,
            id_kios:  request.id_kios, 
            status:  request.status, 
            kategori:  request.kategori, 
        },
        select: {
            id: true, 
            id_provinsi: true,
            id_kabupaten: true,
            id_kecamatan: true,
            id_gudang: true,
            id_distributor: true,
            id_kios: true, 
            status: true, 
            kategori: true, 
        } 
    });
}

const get = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const mapping_profile = await db.mapping_profile.findFirst({
        where: {
            // username: user.username,
            id: id
        },
        select: {
            id: true, 
            id_provinsi: true,
            id_kabupaten: true,
            id_kecamatan: true,
            id_gudang: true,
            id_distributor: true,
            id_kios: true, 
            status: true, 
            kategori: true, 
        }
    });

    if (!mapping_profile) {
        // throw new ResponseError(404, "contact is not found");
        res.status(404).json({ error: 'not found' });
    }

    return mapping_profile;
}

const getallgudang = async (request) => {
    try {
        const { area } = request;
        let data;

        if (area === 'Provinsi') {
            // Ambil data wilayah dengan kategori "Provinsi"
            data = await db.wilayah.findMany({
                where: {
                    kategori: 'Provinsi',
                    status: true
                }
            });
        } else {
            // Ambil data mapping_profile yang memiliki kategori "Kota" atau "Kabupaten"
            const load = await db.mapping_profile.findMany({
                where: {
                    OR: [
                        { kategori: 'Kota' },
                        { kategori: 'Kabupaten' }
                    ],
                    status: true
                },
                include: {
                    Kotakab: {
                        select: {
                            id: true,
                            kategori: true,
                            kode: true,
                            nama: true,
                            long: true,
                            lat: true,
                            alamat: true,
                            status: true
                        }
                    }
                }
            });

            // Transformasi data sesuai dengan kebutuhan
            const transformedData = load.map((profile) => {
                if (profile['Kotakab']) {
                    return {
                        id: profile.id,
                        id_provinsi: profile.id_provinsi,
                        kategori: profile['Kotakab'].kategori,
                        kode: profile['Kotakab'].kode,
                        nama: profile['Kotakab'].nama,
                        long: profile['Kotakab'].long,
                        lat: profile['Kotakab'].lat,
                        alamat: profile['Kotakab'].alamat,
                        status: profile['Kotakab'].status
                    };
                }
            });

            data = transformedData.filter(Boolean); // Hapus elemen yang tidak terdefinisi
        }

        return data;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Internal Server Error');
    } 
};
  
const update = async (request) => {
    // const contact = validate(updateContactValidation, request);

    const totalContactInDatabase = await db.mapping_profile.count({
        where: { 
            id: request.id
        }
    });

    if (totalContactInDatabase !== 1) {
        return res.status(404).json({ error: 'not found' });
    }

    return db.mapping_profile.update({
        where: {
            id: request.id
        },
        data: {
            updated_at:  formattedDate, 
            id_provinsi:  request.id_provinsi,
            id_kabupaten:  request.id_kabupaten,
            id_kecamatan:  request.id_kecamatan,
            id_gudang:  request.id_gudang,
            id_distributor:  request.id_distributor,
            id_kios:  request.id_kios, 
            status:  request.status, 
            kategori:  request.kategori, 
        },
        select: {
            id: true, 
            id_provinsi: true,
            id_kabupaten: true,
            id_kecamatan: true,
            id_gudang: true,
            id_distributor: true,
            id_kios: true, 
            status: true, 
            kategori: true, 
        }
    })
}

const remove = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const totalInDatabase = await db.mapping_profile.count({
        where: {
            // username: user.username,
            id: id
        }
    });

    if (totalInDatabase !== 1) {
        // throw new ResponseError(404, "contact is not found");
        return res.status(404).json({ error: 'not found' });
    }

    return db.mapping_profile.delete({
        where: {
            id: id
        }
    });
}

const search = async (request) => {
    const skip = (request.page - 1) * parseInt(request.size); // Mengonversi request.size menjadi integer

    const filters = [];

    if (request.kode_mapping_profile) {
        filters.push({
            kode_mapping_profile: {
                contains: request.kode_mapping_profile
            }
        });
    }

    if (request.nama_mapping_profile) {
        filters.push({
            nama_mapping_profile: {
                contains: request.nama_mapping_profile
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

    const mapping_profile = await db.mapping_profile.findMany({
        where: {
            OR: filters
        },
        take: parseInt(request.size), // Mengonversi request.size menjadi integer
        skip: skip
    });

    const totalItems = await db.mapping_profile.count({
        where: {
            OR: filters
        }
    });

    return {
        data: mapping_profile,
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
    getallgudang,
    update,
    remove,
    search
}
