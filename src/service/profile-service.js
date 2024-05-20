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
        id,
        kode_petugas,
        nama_petugas,
        contact,
        contact_wa,
        jabatan,
        status_petugas,
        departemen,
        status_kepagawaian,
        email,
        password,
        role_user,
        name_user,
        wilker,
        status_user,
        foto
    } = request;

    try {
        let petugas;
        let user;
        const today = new Date();
        const formattedDate = today.toISOString();
        await db.$transaction(async (db) => {

            const existingPetugas = await db.fact_petugas.findUnique({
                where: {
                    id: id
                }
            });

            if (!existingPetugas) {
                throw new Error('Petugas not found');
            }

            // ambil data petugas di database table fact_petugas
            let kode_petugas_db = existingPetugas.kode_petugas;

            //ambil data user berdasarkan kode_petugas di tbl_user
            const existingUser = await db.tbl_user.findUnique({
                where: {
                    kode_petugas: kode_petugas_db
                }
            });

            if (!existingUser) {
                throw new Error('User not found');
            }

            let id_user = existingUser.id;

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
            }
            if (contact) {
                updateData.contact = contact;
            }
            if (contact_wa) {
                updateData.contact_wa = contact_wa;
            }
            if (jabatan) {
                updateData.jabatan = jabatan;
            }
            if (status_petugas) {
                updateData.status_petugas = status_petugas;
            }
            if (departemen) {
                updateData.departemen = departemen;
            }
            if (status_kepagawaian) {
                updateData.status_kepagawaian = status_kepagawaian;
            }
            if (email) {
                updateDataUser.email = email;
            }
            if (password) {
                // Hash password sebelum disimpan
                const passwordnew = await bcrypt.hash(password, 10);
                updateDataUser.hashed = passwordnew;
            }
            if (role_user) {
                updateDataUser.role = role_user;
            }
            if (name_user) {
                updateDataUser.name = name_user;
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

            // Lakukan update data petugas
            petugas = await db.fact_petugas.update({
                where: {
                    id: id
                },
                data: updateData
            });

            // Lakukan update data user
            user = await db.tbl_user.update({
                where: {
                    id: id_user
                },
                data: updateDataUser
            });
        });

        res.status(200).send({ petugas, user });
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
