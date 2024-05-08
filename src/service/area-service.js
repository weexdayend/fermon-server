import { db } from "../application/database.js";
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

import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";


const accumulation = async (request, res) => {
    try {
        const { keyp, keyk } = request;

        let data;
        if (keyp === 'all' && keyk === 'all') {
            data = await db.mapping_profile.findMany();
        } else if (keyp !== 'all' && keyk === 'all') {
            data = await db.mapping_profile.findMany({
                where: {
                    id_provinsi: keyp,
                }
            });
        } else {
            data = await db.mapping_profile.findMany({
                where: {
                    id_provinsi: keyp,
                    id_kabupaten: keyk
                }
            });
        }

        const wilayahCategoriesCount = data.reduce((acc, curr) => {
            if (curr && curr.kategori) {
                acc[curr.kategori] = (acc[curr.kategori] || 0) + 1;
            }
            return acc;
        }, {});

        const totalCategoriesCount = { ...wilayahCategoriesCount };

        delete totalCategoriesCount['Kota'];
        delete totalCategoriesCount['Kabupaten'];
        delete totalCategoriesCount['Provinsi'];

        let response;
        if (data.length === 0) {
            response = {
                total_area: []
            }
        } else {
            const calculate = {
                total_area: Object.keys(totalCategoriesCount).map((category) => {
                    let key = category.toLowerCase();
                    if (category === 'Kota/Kab') {
                        key = 'kotakab';
                    }
                    const name = category;

                    let resource = '';
                    if (category === 'Provinsi') {
                        resource = 'wilayah';
                    } else if (category === 'Kota/Kab') {
                        resource = 'wilayah';
                    } else if (category === 'Kecamatan') {
                        resource = 'wilayah';
                    } else if (category === 'Gudang') {
                        resource = 'profile';
                    } else if (category === 'Distributor') {
                        resource = 'profile';
                    } else if (category === 'Kios') {
                        resource = 'profile';
                    }

                    return {
                        total: totalCategoriesCount[category],
                        key,
                        name,
                        resource
                    }
                })
            };

            response = calculate;
        }

        // Set CORS headers
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');

        res.status(200).json(response);
    } catch (error) {
        res.status(500).send(error.message);
    }
}
const detail = async (request, res) => {
    try {
        const { key, resource } = request;

        let mapping = key.charAt(0).toUpperCase() + key.slice(1);
        let data;

        if (resource === 'wilayah') {
            if (key === 'Provinsi') {
                data = await db.fact_wilayah.findMany({
                    where: {
                        kategori: key,
                        status: true
                    },
                });
            } else if (key === 'Kotakab') {
                data = await db.fact_wilayah.findMany({
                    where: {
                        OR: [
                            { kategori: 'Kota' },
                            { kategori: 'Kabupaten' }
                        ],
                        status: true
                    },
                    include: {
                        Kotakab: {
                            include: {
                                Provinsi: true
                            }
                        }
                    }
                });
                // Transform data
            } else {
                data = await db.fact_wilayah.findMany({
                    where: {
                        kategori: key,
                        status: true
                    },
                    include: {
                        [mapping]: {
                            where: {
                                kategori: key,
                                status: true
                            },
                            include: {
                                Provinsi: true,
                                Kotakab: true,
                                Kecamatan: true
                            }
                        }
                    }
                });
                // Transform data
            }
        } else if (resource === 'profile') {
            data = await db.fact_profile.findMany({
                where: {
                    kategori: key,
                    status: true
                },
                include: {
                    [mapping]: {
                        where: {
                            kategori: key,
                            status: true
                        },
                        include: {
                            Provinsi: true,
                            Kotakab: true,
                            Kecamatan: true,
                            Gudang: true,
                            Distributor: true,
                            Kios: true
                        }
                    }
                }
            });
            // Transform data
        } else {
            return res.status(400).json({ error: 'Invalid resource' });
        }

        // Set CORS headers
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');

        res.status(200).json(data);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
}
const filter = async (request, res) => {

    try {
        let area = request.area || '';
        area = area.charAt(0).toUpperCase() + area.slice(1);

        let data;
        if (area === 'Provinsi') {
            data = await db.fact_wilayah.findMany({
                where: {
                    kategori: area,
                    status: true
                }
            });
        } else {
            const load = await db.mapping_profile.findMany({
                where: {
                    OR: [
                        { kategori: 'Kota' },
                        { kategori: 'Kabupaten' }
                    ],
                    status: true
                },
                include: {
                    Kotakab: true
                }
            });

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
                        status: profile['Kotakab'].status_mapping
                    };
                }
            });

            data = transformedData.filter(Boolean); // Remove undefined elements
        }

        // Set CORS headers
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');

        // Return the response
        res.status(200).json(data);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
}
const report = async (request, res) => {

    try {
        const { p, kk, sMonth, sYear, eMonth, eYear } = request;

        let whereClause = {
            bulan: {
                gte: Number(sMonth),
                lte: Number(eMonth),
            },
            tahun: {
                gte: Number(sYear),
                lte: Number(eYear),
            },
            OR: [],
        };

        // Add kode_provinsi condition to OR clause if p is not 'all'
        if (p !== 'all') {
            whereClause.OR.push({
                kode_provinsi: p,
            });
        }

        // Add kode_kab_kota condition to OR clause if kk is not 'all'
        if (kk !== 'all') {
            whereClause.OR.push({
                kode_kab_kota: {
                    contains: kk,
                },
            });
        }

        // If OR array is empty, remove it from the whereClause
        if (whereClause.OR.length === 0) {
            delete whereClause.OR;
        }

        const f5 = await db.mart_accumulation_products_f5_wilayah.groupBy({
            by: ['nama_produk', 'keterangan'],
            _sum: {
                besaran: true,
                total: true,
            },
            where: whereClause,
        });

        const f6 = await db.mart_accumulation_products_f6_wilayah.groupBy({
            by: ['nama_produk', 'keterangan'],
            _sum: {
                besaran: true,
                total: true,
            },
            where: whereClause,
        });

        let data = {
            f5: f5,
            f6: f6,
        };

        // Set CORS headers
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');

        // Return the response
        res.status(200).json(data);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
}

const getarea = async (request, res) => {

    try {
        const {
            kode_provinsi,
            kode_kab_kota,
            kode_kecamatan,
            kode_gudang,
            kode_distributor,
            kode_pengecer,
            kategori,
            tahun
        } = request;

        let wheremap = {
            OR: [
                { kategori: 'Gudang' },
                { kategori: 'Distributor' },
                { kategori: 'Pengecer' },
            ]
        };

        if (kode_provinsi !== '' && kode_provinsi !== null) {
            wheremap.kode_provinsi = kode_provinsi;
        }
        if (kode_kab_kota !== '' && kode_kab_kota !== null) {
            wheremap.kode_kab_kota = kode_kab_kota;
        }
        if (kode_kecamatan !== '' && kode_kecamatan !== null) {
            wheremap.kode_kecamatan = kode_kecamatan;
        }
        if (kode_gudang !== '' && kode_gudang !== null) {
            wheremap.kode_gudang = kode_gudang;
        }
        if (kode_distributor !== '' && kode_distributor !== null) {
            wheremap.kode_distributor = kode_distributor;
        }
        if (kode_pengecer !== '' && kode_pengecer !== null) {
            wheremap.kode_pengecer = kode_pengecer;
        }
        if (kategori !== '' && kategori !== null) {
            wheremap.kategori = kategori;
        }
        if (tahun !== '' && tahun !== null) {
            wheremap.tahun = tahun;
        }

        let allRekonstruksiData = [];

        await db.$transaction(async (db) => {
            const [provinsi, kabupaten, kecamatan, gudangs, distributor, kios, mappingarea] = await Promise.all([
                db.fact_provinsi.findMany({
                    select: {
                        id: true,
                        kode_provinsi: true,
                        nama_provinsi: true
                    }
                }),
                db.fact_kab_kota.findMany({
                    select: {
                        id: true,
                        kode_kab_kota: true,
                        nama_kab_kota: true
                    }
                }),
                db.fact_kecamatan.findMany({
                    select: {
                        id: true,
                        kode_kecamatan: true,
                        nama_kecamatan: true
                    }
                }),
                db.fact_gudang.findMany({
                    select: {
                        id: true,
                        kode_gudang: true,
                        nama_gudang: true
                    }
                }),
                db.fact_distributor.findMany({
                    select: {
                        id: true,
                        kode_distributor: true,
                        nama_distributor: true
                    }
                }),
                db.fact_kios.findMany({
                    select: {
                        id: true,
                        kode_pengecer: true,
                        nama_pengecer: true
                    }
                }),
                db.fact_map_area.findMany({
                    where: wheremap,
                    select: {
                        id: true,
                        kode_provinsi: true,
                        kode_kab_kota: true,
                        kode_kecamatan: true,
                        kode_gudang: true,
                        kode_distributor: true,
                        kode_pengecer: true,
                        kategori: true,
                        tahun: true,
                    },
                    orderBy: {
                        kode_provinsi: 'asc',
                    }
                })
            ]);

            allRekonstruksiData = mappingarea.map(area => {
                const wilayahProvinsi = provinsi.find(p => p.kode_provinsi === area.kode_provinsi);
                const wilayahKabupaten = kabupaten.find(kb => kb.kode_kab_kota === area.kode_kab_kota);
                const wilayahKecamatan = kecamatan.find(kc => kc.kode_kecamatan === area.kode_kecamatan);
                const gudangData = gudangs.find(g => g.kode_gudang === area.kode_gudang);
                const distributorData = distributor.find(d => d.kode_distributor === area.kode_distributor);
                const kiosData = kios.find(k => k.kode_pengecer === area.kode_pengecer);

                return {
                    id: area.id,
                    kode_provinsi: area.kode_provinsi,
                    nama_provinsi: wilayahProvinsi ? wilayahProvinsi.nama_provinsi : null,
                    kode_kab_kota: area.kode_kab_kota,
                    kabupaten_kota: wilayahKabupaten ? wilayahKabupaten.nama_kab_kota : null,
                    kode_kecamatan: area.kode_kecamatan,
                    nama_kecamatan: wilayahKecamatan ? wilayahKecamatan.nama_kecamatan : null,
                    kode_gudang: area.kode_gudang,
                    nama_gudang: gudangData ? gudangData.nama_gudang : null,
                    kode_distributor: area.kode_distributor,
                    nama_distributor: distributorData ? distributorData.nama_distributor : null,
                    kode_pengecer: area.kode_pengecer,
                    nama_pengecer: kiosData ? kiosData.nama_pengecer : null,
                    kategori: area.kategori,
                    tahun: area.tahun,

                };
            });
        });

        res.status(200).send(allRekonstruksiData);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
}

const update = async (request, res) => {

    const { id, kode_provinsi, kode_kab_kota, kode_kecamatan, kode_gudang, kode_distributor, kode_pengecer, kategori, tahun } = request;

    let dataUpdate = {};

    if (kategori == "Gudang") {
        dataUpdate = {
            kode_provinsi: kode_provinsi,
            kode_kab_kota: kode_kab_kota,
            kode_kecamatan: kode_kecamatan,
            kode_gudang: kode_gudang,
            kode_distributor: kode_distributor,
            kode_pengecer: long,
            kategori: kategori,
            tahun: tahun,
        }
    }
    if (kategori == "Distributor") {
        dataUpdate = {
            kode_provinsi: kode_provinsi,
            kode_kab_kota: kode_kab_kota,
            kode_kecamatan: kode_kecamatan,
            kode_gudang: kode_gudang,
            kode_distributor: kode_distributor,
            kode_pengecer: long,
            kategori: kategori,
            tahun: tahun,
        }
    }
    if (kategori == "Pengecer") {
        dataUpdate = {
            kode_provinsi: kode_provinsi,
            kode_kab_kota: kode_kab_kota,
            kode_kecamatan: kode_kecamatan,
            kode_gudang: kode_gudang,
            kode_distributor: kode_distributor,
            kode_pengecer: long,
            kategori: kategori,
            tahun: tahun,
        }
    }
    try {
        let updateArea;
        await db.$transaction(async (db) => {

            updateArea = await db.fact_map_area.update({
                where: {
                    id: id
                },
                data: dataUpdate
            });
        });
        res.status(200).send(updateArea);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

export default {
    accumulation,
    detail,
    filter,
    report,
    getarea,
    update,
}
