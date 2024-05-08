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


const head = async (request, res) => {
    try {
        const { key, kat } = request;
        let ids = key.toString();

        let data;
        const load = await db.fact_profile.findMany({
            where: {
                kode: key,
                status: true
            },
            include: {
                [kat]: {
                    where: {
                        kategori: kat,
                        status: true
                    },
                    include: {
                        Provinsi: true,
                        Kotakab: true,
                        Kecamatan: true,
                    }
                }
            }
        });

        const transformedData = load.flatMap((profile) => {
            if (profile[kat] && profile[kat].length > 0) {
                return profile[kat].map((item) => ({
                    id: profile.id,
                    created_at: profile.created_at,
                    updated_at: profile.updated_at,
                    deleted_at: profile.deleted_at,
                    kategori: profile.kategori,
                    kode: profile.kode,
                    nama: profile.nama,
                    long: profile.long,
                    lat: profile.lat,
                    alamat: profile.alamat,
                    status: profile.status,
                    provinsi: item.Provinsi.nama,
                    kabupaten: item.Kotakab.nama,
                    kecamatan: item.Kecamatan.nama
                }));
            } else {
                // If no data for the specified category, return an empty object
                return {
                    id: profile.id,
                    created_at: profile.created_at,
                    updated_at: profile.updated_at,
                    deleted_at: profile.deleted_at,
                    kategori: profile.kategori,
                    kode: profile.kode,
                    nama: profile.nama,
                    long: profile.long,
                    lat: profile.lat,
                    alamat: profile.alamat,
                    status: profile.status,
                    provinsi: null,
                    kabupaten: null,
                    kecamatan: null
                };
            }
        });

        data = transformedData;

        const result = {
            data,
        };

        // Set CORS headers
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');

        // Return the response
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
}
const detail = async (request, res) => {
    try {
        const { key, kat, sMonth, sYear, eMonth, eYear } = request;
        let ids = key.toString();

        let distribusi;
        if (kat === 'distributor') {
            distribusi = await db.mart_accumulation_products_f5_distributor.groupBy({
                by: ['nama_produk', 'keterangan'],
                _sum: {
                    besaran: true,
                    total: true,
                },
                where: {
                    bulan: {
                        gte: Number(sMonth),
                        lte: Number(eMonth),
                    },
                    tahun: {
                        gte: Number(sYear),
                        lte: Number(eYear),
                    },
                    kode_distributor: ids
                },
            });
        } else if (kat === 'kios') {
            distribusi = await db.mart_accumulation_products_f6_kios.groupBy({
                by: ['nama_produk', 'keterangan'],
                _sum: {
                    besaran: true,
                    total: true,
                },
                where: {
                    bulan: {
                        gte: Number(sMonth),
                        lte: Number(eMonth),
                    },
                    tahun: {
                        gte: Number(sYear),
                        lte: Number(eYear),
                    },
                    kode_pengecer: ids
                },
            });
        } else {
            distribusi = [];
        }

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Return the response
        res.status(200).json(distribusi);
    } catch (error) {
        console.error('🔴 Error', error);
        res.status(500).send('Internal Server Error');
    }
}
const mapping = async (request, res) => {
    try {
        const { prov, kab } = request;

        let whereClause = {
            kategori: {
                in: ['Gudang', 'Distributor', 'Kios'],
            },
            OR: [],
        };

        if (prov !== 'all') {
            whereClause.OR.push({
                id_provinsi: prov,
            });
        }

        if (kab !== 'all') {
            whereClause.OR.push({
                id_kabupaten: {
                    contains: kab,
                },
            });
        }

        if (whereClause.OR.length === 0) {
            delete whereClause.OR;
        }

        let data = await db.mapping_profile.findMany({
            where: whereClause,
            include: {
                Gudang: true,
                Distributor: true,
                Kios: true,
                Kecamatan: true,
                Provinsi: true,
            }
        });

        let transformedData = data.map(item => {
            let transformedItem = {
                id: item.id,
                id_provinsi: item.id_provinsi,
                id_kabupaten: item.id_kabupaten,
                id_kecamatan: item.id_kecamatan,
                id_gudang: item.Gudang ? item.Gudang.id : null,
                id_distributor: item.Distributor ? item.Distributor.kode : null,
                id_kios: item.Kios ? item.Kios.id : null,
                status: item.status,
                kategori: item.kategori,
            };

            if (item.Provinsi) {
                transformedItem.provinsi = item.Provinsi.nama;
            }

            if (item.Gudang) {
                transformedItem.kode = item.Gudang.kode;
                transformedItem.nama = item.Gudang.nama;
                transformedItem.long = item.Gudang.long;
                transformedItem.lat = item.Gudang.lat;
                transformedItem.alamat = item.Gudang.alamat;

                if (item.Kecamatan && item.Gudang.kode === item.Gudang.kode) {
                    transformedItem.kecamatan = item.Kecamatan.nama;
                }
            }

            if (item.Distributor) {
                transformedItem.kode = item.Distributor.kode;
                transformedItem.nama = item.Distributor.nama;
                transformedItem.long = item.Distributor.long;
                transformedItem.lat = item.Distributor.lat;
                transformedItem.alamat = item.Distributor.alamat;

                if (item.Kecamatan && item.Distributor.kode === item.Distributor.kode) {
                    transformedItem.kecamatan = item.Kecamatan.nama;
                }
            }

            if (item.Kios) {
                transformedItem.kode = item.Kios.kode;
                transformedItem.nama = item.Kios.nama;
                transformedItem.long = item.Kios.long;
                transformedItem.lat = item.Kios.lat;
                transformedItem.alamat = item.Kios.alamat;

                if (item.Kecamatan && item.Kios.kode === item.Kios.kode) {
                    transformedItem.kecamatan = item.Kecamatan.nama;
                }
            }

            return transformedItem;
        });

        const groupedData = transformedData.reduce((acc, item) => {
            const key = `${item.kode}-${item.nama}`;

            if (!acc[key]) {
                acc[key] = {
                    id: item.id,
                    id_provinsi: item.id_provinsi,
                    id_kabupaten: item.id_kabupaten,
                    id_kecamatan: item.id_kecamatan,
                    id_gudang: item.id_gudang,
                    id_distributor: item.id_distributor,
                    id_kios: item.id_kios,
                    status: item.status,
                    provinsi: item.provinsi,
                    kategori: item.kategori,
                    kode: item.kode,
                    nama: item.nama,
                    long: item.long,
                    lat: item.lat,
                    alamat: item.alamat,
                    wilker: [],
                };
            }

            if (item.kecamatan && !acc[key].wilker.includes(item.kecamatan)) {
                acc[key].wilker.push({ nama: item.kecamatan });
            }

            return acc;
        }, {});

        const transform = Object.values(groupedData);

        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        res.status(200).json(transform);
    } catch (error) {
        // console.log('🔴 Error', error);
        res.status(500).send('Internal Server Error');
    }
}
export default {
    head,
    detail,
    mapping,
}
