import { db } from "../application/database.js";
import csv from "fast-csv";
import fs from "fs";
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
const execPromisified = promisify(exec);
import { Op, literal } from 'sequelize';

import { createDomain } from 'domain';
import delay from 'delay';
const today = new Date();
const formattedDate = today.toISOString();

const create = async (request) => {
    return db.tbl_wilayah.create({
        data: {
            created_at: formattedDate,
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

const get = async (request) => {

    const wilayah = await db.tbl_wilayah.findUnique({
        where: {
            OR: [
                { id: request.id },
                { kode: request.kode }
            ]
        },
        select: {
            id: true,
            kode: true,
            nama: true,
            kode_wilayah: true,
        }
    });

    if (!wilayah) {
        res.status(404).json({ error: 'not found' });
    }

    return wilayah;
}
const getprovinsi = async (request, res) => {

    try {
        let result;
        await db.$transaction(async (db) => {
            result = await db.$queryRaw`
                SELECT * FROM tbl_wilayah
                WHERE CHAR_LENGTH(kode) = ${2};
            `;
        });

        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
};
const getkabupaten = async (request, res) => {
    try {
        let result;
        await db.$transaction(async (db) => {

            result = await db.$queryRaw`
                SELECT * FROM tbl_wilayah
                WHERE LEFT(kode,2) = ${request.kode} AND CHAR_LENGTH(kode) = ${5};
            `;
        });
        res.status(200).send(result);
    } catch (error) {
        // throw new Error(error.message);
        res.status(500).send(error.message);
    }
};

const getkecamatan = async (request, res) => {
    // try {
    //     const wilayah = await db.$queryRaw`
    //         SELECT * FROM tbl_wilayah
    //         WHERE LEFT(kode,5) = ${request.kode} AND CHAR_LENGTH(kode) = ${8};
    //     `;

    //     return wilayah;
    // } catch (error) {
    //     throw new Error(error.message);
    // }
    try {
        let result;
        await db.$transaction(async (db) => {

            result = await db.$queryRaw`
                 SELECT * FROM tbl_wilayah
                 WHERE LEFT(kode,5) = ${request.kode} AND CHAR_LENGTH(kode) = ${8};
            `;
        });
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getall = async (res) => {
    try {
        let result;
        await db.$transaction(async (db) => {

            result = await db.$queryRaw`
                SELECT *, 'Provinsi' as keterangan FROM tbl_wilayah WHERE CHAR_LENGTH(kode) = ${2}
                union 
                SELECT *, 'Kabupaten' as keterangan FROM tbl_wilayah WHERE CHAR_LENGTH(kode) = ${5}
                union 
                SELECT *, 'Kecamatan' as keterangan FROM tbl_wilayah WHERE CHAR_LENGTH(kode) = ${8}
                    ;
            `;
        });

        // Initialize arrays to hold the data for each level
        const provinsi = [];
        const kabupaten = [];
        const kecamatan = [];

        // Separate the data into respective arrays
        result.forEach(row => {
            if (row.keterangan === 'Provinsi') {
                provinsi.push(row);
            } else if (row.keterangan === 'Kabupaten') {
                kabupaten.push(row);
            } else if (row.keterangan === 'Kecamatan') {
                kecamatan.push(row);
            }
        });

        // Sort the data within each array based on the 'kode' field
        provinsi.sort((a, b) => a.kode.localeCompare(b.kode));
        kabupaten.sort((a, b) => a.kode.localeCompare(b.kode));
        kecamatan.sort((a, b) => a.kode.localeCompare(b.kode));

        // Concatenate the arrays in the desired order
        const orderedData = [];

        // Loop through Provinsi data
        provinsi.forEach(provinsiRow => {
            orderedData.push(provinsiRow);

            // Find Kabupaten with matching kode
            const matchingKabupaten = kabupaten.filter(kabupatenRow => kabupatenRow.kode.startsWith(provinsiRow.kode));
            matchingKabupaten.forEach(kabupatenRow => {
                orderedData.push(kabupatenRow);

                // Find Kecamatan with matching kode
                const matchingKecamatan = kecamatan.filter(kecamatanRow => kecamatanRow.kode.startsWith(provinsiRow.kode) && kecamatanRow.kode.startsWith(kabupatenRow.kode));
                orderedData.push(...matchingKecamatan);
            });
        });

        res.status(200).send(orderedData);
    } catch (error) {
        res.status(500).send(error.message);
    }
}
const update = async (request) => {
    let updatedData = null;

    await db.$transaction(async (db) => {
        // Memeriksa jumlah data yang sesuai dengan id yang diberikan
        const totalContactInDatabase = await db.tbl_wilayah.count({
            where: {
                id: request.id
            }
        });

        if (totalContactInDatabase !== 1) {
            throw new Error('Data not found');
        }

        // Melakukan pembaruan data
        updatedData = await db.tbl_wilayah.update({
            where: {
                id: request.id
            },
            data: {
                kode: request.kode,
                nama: request.nama,
                kode_wilayah: request.kode_wilayah,
            },
            select: {
                id: true,
                kode: true,
                nama: true,
                kode_wilayah: true,
            }
        });
    });

    return updatedData;
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

    if (request.nama) {
        filters.push({
            nama: {
                contains: request.nama
            }
        });
    }


    const wilayah = await db.tbl_wilayah.findMany({
        where: {
            OR: filters
        },
        take: parseInt(request.size), // Mengonversi request.size menjadi integer
        skip: skip
    });

    const totalItems = await db.tbl_wilayah.count({
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

const getfactprovinsi = async (request, res) => {

    const { 
        kode,
        nama
    } = request;
    try {
 
        let filter = {};
        if (kode !== '' && kode !== null) {
            filter.kode_provinsi = kode;
        }
        if (nama !== '' && nama !== null) {
            filter.nama_provinsi = nama;
        }

        const wilayah = await db.fact_provinsi.findMany({
            where: filter
        });

        if (!wilayah) { 
            res.status(200).send("provinsi not found");
        }

        res.status(200).send(wilayah);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}
const getfactkabupaten = async (request, res) => {

    const { 
        kode,
        nama
    } = request;
    try {
 
        let filter = {};
        if (kode !== '' && kode !== null) {
            filter.kode_kab_kota = kode;
        }
        if (nama !== '' && nama !== null) {
            filter.nama_kabupaten = nama;
        }

        const wilayah = await db.fact_kab_kota.findMany({
            where: filter
        });

        if (!wilayah) { 
            res.status(200).send("kabupaten not found");
        }

        res.status(200).send(wilayah);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}
const getfactkecamatan = async (request, res) => {

    const { 
        kode,
        nama
    } = request;
    try {
 
        let filter = {};
        if (kode !== '' && kode !== null) {
            filter.kode_kecamatan = kode;
        }
        if (nama !== '' && nama !== null) {
            filter.nama_kecamatan = nama;
        }

        const wilayah = await db.fact_kecamatan.findMany({
            where: filter
        });

        if (!wilayah) { 
            res.status(200).send("kecamatan not found");
        }

        res.status(200).send(wilayah);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

const updategetfactprovinsi = async (request, res) => {
    let updatedData = null;

    await db.$transaction(async (db) => {
        // Memeriksa jumlah data yang sesuai dengan id yang diberikan
        const totalContactInDatabase = await db.fact_provinsi.count({
            where: {
                id: request.id
            }
        });

        if (totalContactInDatabase !== 1) { 
            res.status(200).send("Data not found");
        }

        // Melakukan pembaruan data
        updatedData = await db.fact_provinsi.update({
            where: {
                id: request.id
            },
            data: {
                kode_provinsi: request.kode,
                nama_provinsi: request.nama 
            } 
        });
    });

    res.status(200).send(updatedData);
}
const updategetfactkabupaten = async (request) => {
    let updatedData = null;

    await db.$transaction(async (db) => {
        // Memeriksa jumlah data yang sesuai dengan id yang diberikan
        const totalContactInDatabase = await db.fact_kab_kota.count({
            where: {
                id: request.id
            }
        });

        if (totalContactInDatabase !== 1) {
            res.status(200).send("Data not found");
        }

        // Melakukan pembaruan data
        updatedData = await db.fact_kab_kota.update({
            where: {
                id: request.id
            },
            data: {
                kode_kab_kota: request.kode,
                nama_kab_kota: request.nama 
            } 
        });
    });

    res.status(200).send(updatedData);
}
const updategetfactkecamatan = async (request) => {
    let updatedData = null;

    await db.$transaction(async (db) => {
        // Memeriksa jumlah data yang sesuai dengan id yang diberikan
        const totalContactInDatabase = await db.fact_kecamatan.count({
            where: {
                id: request.id
            }
        });

        if (totalContactInDatabase !== 1) {
            res.status(200).send("Data not found");
        }

        // Melakukan pembaruan data
        updatedData = await db.fact_kecamatan.update({
            where: {
                id: request.id
            },
            data: {
                kode_kecamatan: request.kode,
                nama_kecamatan: request.nama 
            } 
        });
    });

    res.status(200).send(updatedData);
}
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
    // search
}
