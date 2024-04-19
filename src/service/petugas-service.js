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
    return db.petugas.create({
        data: {
            created_at:  formattedDate, 
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
    });
}

const get = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const petugas = await db.petugas.findFirst({
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
}
const getall = async (id, res) => { 
    const petugas = await db.petugas.findMany({ 
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

    // Check apakah ada data petugas
    if (petugas.length === 0) {
        return res.status(404).json({ error: 'Petugas not found' });
    }

    const profile = await db.profile.findMany({ 
        select: {
            id: true, 
            kode: true,
            kategori: true,
            nama: true,
            long: true,
            lat: true,
            alamat: true,
            status: true,
        }
    });

    const wilayah = await db.wilayah.findMany({ 
        select: {
            id: true, 
            kode: true,
            nama: true,
            kategori: true, 
            status: true,
        }
    });

    const mappingpetugas = await db.mapping_petugas.findMany({ 
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

     // Memproses data ulang
    const reconstructedData = petugas.map(petugasItem => {
        // Memfilter data mapping petugas yang sesuai dengan id petugas saat ini
        const mappedData = mappingpetugas.filter(item => item.id_petugas === petugasItem.id && (item.id_gudang || item.id_distributor || item.id_kios)); // Filter untuk menghapus yang id_gudang, id_distributor, dan id_kios-nya null
        // Mengonversi id wilayah menjadi nama wilayah
        const wilayahData = mappedData.map(item => {
            if (item.id_gudang) {
                const wilayahInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_provinsi);
                const kabupatenInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_kabupaten);
                const kecamatanInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_kecamatan);
                
                return {
                    id: item.id,
                    id_provinsi: item.id_provinsi,
                    provinsi: wilayahInfo ? wilayahInfo.nama : null,
                    id_kabupaten: item.id_kabupaten,
                    kabupaten: kabupatenInfo ? kabupatenInfo.nama : null,
                    id_kecamatan: item.id_kecamatan,
                    kecamatan: kecamatanInfo ? kecamatanInfo.nama : null,
                    id_gudang: item.id_gudang,
                    gudang: profile.find(profileItem => profileItem.kode === item.id_gudang)?.nama || null,
                    status: item.status
                };
            } else {
                return null;
            }
        }).filter(wilayahData => wilayahData !== null);
        
        // Mengonversi id distributor menjadi nama distributor
        const distributorData = mappedData.map(item => {
            if (item.id_distributor) {
                const wilayahInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_provinsi);
                const kabupatenInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_kabupaten);
                const kecamatanInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_kecamatan);

                const distributorInfo = profile.find(profileItem => profileItem.kode === item.id_distributor);
                return {
                    id: item.id,
                    id_provinsi: item.id_provinsi,
                    provinsi: wilayahInfo ? wilayahInfo.nama : null,
                    id_kabupaten: item.id_kabupaten,
                    kabupaten: kabupatenInfo ? kabupatenInfo.nama : null,
                    id_kecamatan: item.id_kecamatan,
                    kecamatan: kecamatanInfo ? kecamatanInfo.nama : null,
                    id_distributor: item.id_distributor,
                    distributor: distributorInfo ? distributorInfo.nama : null,
                    status: item.status
                };
            } else {
                return null;
            }
        }).filter(distributorData => distributorData !== null);

        // Mengonversi id kios menjadi nama kios
        const kiosData = mappedData.map(item => {
            if (item.id_kios) {
                const wilayahInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_provinsi);
                const kabupatenInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_kabupaten);
                const kecamatanInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_kecamatan);

                const kiosInfo = profile.find(profileItem => profileItem.kode === item.id_kios);
                return {
                    id: item.id,
                    id_provinsi: item.id_provinsi,
                    provinsi: wilayahInfo ? wilayahInfo.nama : null,
                    id_kabupaten: item.id_kabupaten,
                    kabupaten: kabupatenInfo ? kabupatenInfo.nama : null,
                    id_kecamatan: item.id_kecamatan,
                    kecamatan: kecamatanInfo ? kecamatanInfo.nama : null,
                    id_kios: item.id_kios,
                    kios: kiosInfo ? kiosInfo.nama : null,
                    status: item.status
                };
            } else {
                return null;
            }
        }).filter(kiosData => kiosData !== null);

        return {
            ...petugasItem,
            gudang: wilayahData,
            distributor: distributorData,
            kios: kiosData
        };
    });


    return reconstructedData;
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
}
 
export default {
    create,
    get,
    getall,
    update,
    remove,
    search
}
