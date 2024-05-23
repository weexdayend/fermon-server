import { db } from "../application/database.js";
import csv from "fast-csv";
import fs from "fs";
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
const execPromisified = promisify(exec);
import bcrypt from "bcrypt";
import { createDomain } from 'domain';
import delay from 'delay';
const today = new Date();
const formattedDate = today.toISOString();

const create = async (request) => {
    return db.profile.create({
        data: {
            created_at: formattedDate,
            kode: request.kode,
            kategori: request.kategori,
            nama: request.nama,
            long: request.long,
            lat: request.lat,
            alamat: request.alamat,
            status: request.status,
        },
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
}

const get = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const profile = await db.profile.findFirst({
        where: {
            // username: user.username,
            id: id
        },
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

    if (!profile) {
        // throw new ResponseError(404, "contact is not found");
        res.status(404).json({ error: 'not found' });
    }

    return profile;
}
const getall = async (id, res) => {
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

    // Check apakah ada data petugas
    if (profile.length === 0) {
        return res.status(404).json({ error: 'profile not found' });
    }


    return profile;
}
/* const update = async (request) => {
 

    const totalContactInDatabase = await db.profile.count({
        where: { 
            id: request.id
        }
    });

    if (totalContactInDatabase !== 1) {
        return res.status(404).json({ error: 'not found' });
    }

    return db.profile.update({
        where: {
            id: request.id
        },
        data: {
            updated_at:  formattedDate, 
            kode:  request.kode,
            kategori:  request.kategori,
            nama:  request.nama,
            long:  request.long,
            lat:  request.lat,
            alamat:  request.alamat,
            status:  request.status, 
        },
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
    })
} */
const update = async (request, res) => {
    const {
        id_user,
        kode_petugas,
        nama_petugas,
        contact,
        whatsapp,
        jabatan,
        status_petugas,
        status_kepagawaian,
        email,
        role_user,
        wilker,
        foto
    } = request;

    try {
        const today = new Date();
        const formattedDate = today.toISOString();
        await db.$transaction(async (db) => {

            //ambil data user berdasarkan kode_petugas di tbl_user
            const existingUser = await db.tbl_user.findUnique({
                where: {
                    id: id_user
                }
            });

            let kode_petugas_db = existingUser.kode_petugas;

            if (!existingUser) {
                throw new Error('User not found');
            }

            const existingPetugas = await db.fact_petugas.findUnique({
                where: {
                    kode_petugas: kode_petugas_db
                }
            });

            let id_petugas_db = existingPetugas.id;

            if (!existingPetugas) {
                throw new Error('Petugas not found');
            }

            let updateData = {
                updated_at: formattedDate
            };

            let updateDataUser = {
                updated_at: formattedDate
            };

            if (kode_petugas) {
                updateData.kode_petugas = kode_petugas;
                updateDataUser.kode_petugas = kode_petugas;
            }

            if (nama_petugas) {
                updateData.nama_petugas = nama_petugas;
                updateDataUser.name = nama_petugas;
            }

            if (contact) {
                updateData.contact = contact;
            }

            if (whatsapp) {
                updateData.contact_wa = whatsapp;
            }

            if (jabatan) {
                updateData.jabatan = jabatan;
            }

            if (status_petugas) {
                updateData.status_petugas = status_petugas;
            }

            if (status_kepagawaian) {
                updateData.status_kepagawaian = status_kepagawaian;
            }

            if (email) {
                updateDataUser.email = email;
            }

            if (role_user) {
                updateDataUser.role = role_user;
            }

            if (wilker) {
                updateData.wilker = wilker;
            }

            if (status_user) {
                updateDataUser.status_user = status_user;
            }

            if (foto) {
                updateData.foto = foto;
            }

            if (Object.keys(updateData).length <= 1) {
                throw new Error('Setidaknya satu field harus memiliki nilai untuk melakukan update.');
            }

            // Lakukan update data user
            await db.tbl_user.update({
                where: {
                    id: id_user
                },
                data: updateDataUser
            });

            // Lakukan update data petugas
            await db.fact_petugas.update({
                where: {
                    id: id_petugas_db
                },
                data: updateData
            });

        });

        res.status(200).send({message: "Successfully updated data petugas."});
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}
const remove = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const totalInDatabase = await db.profile.count({
        where: {
            // username: user.username,
            id: id
        }
    });

    if (totalInDatabase !== 1) {
        // throw new ResponseError(404, "contact is not found");
        return res.status(404).json({ error: 'not found' });
    }

    return db.profile.delete({
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

    if (request.nama) {
        filters.push({
            nama: {
                contains: request.nama
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

    const profile = await db.profile.findMany({
        where: {
            OR: filters
        },
        take: parseInt(request.size), // Mengonversi request.size menjadi integer
        skip: skip
    });

    const totalItems = await db.profile.count({
        where: {
            OR: filters
        }
    });

    return {
        data: profile,
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
