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

const create = async (request, res) => {
    if (!request.password) {
        throw new Error("Password is required");
    }

    // Mulai transaksi
    return db.$transaction(async (db) => {
        // Cek jumlah email yang sudah ada
        const countEmail = await db.tbl_user.count({
            where: {
                email: request.email
            }
        });

        // Jika email sudah ada, lempar error
        if (countEmail === 1) {
            throw new Error(`Email ${request.email} already exists`);
        }

        // Hash password sebelum disimpan
        const password = await bcrypt.hash(request.password, 10);

        // Buat data pengguna baru
        const newUser = await db.tbl_user.create({
            data: {
                name: request.name,
                email: request.email,
                hashed: password,
                image: request.image,
                role: request.role,
                status_user: request.status_user,
            },
            select: {
                email: true,
                role: true,
                name: true
            }
        });

        res.status(200).send(newUser);
    });
}

const createlog = async (request, res) => {
    const {
        username,
        activity,
        desc_activity
    } = request;

    try {
        let newLog;

        await db.$transaction(async (db) => {

            newLog = await db.log_activity.create({
                data: {
                    username: username,
                    activity: activity,
                    desc_activity: desc_activity,
                    activity_at: formattedDate
                },
            });
        });

        res.status(200).send(newLog);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
}

const login_user = async (request, res) => {
    const { username, password } = request;

    return db.$transaction(async (db) => {
        const user = await db.tbl_user.findUnique({
            where: {
                email: username,
                OR: [
                    { role: 'ADMIN' },
                    { role: 'SUPER ADMIN' },
                ]
            },
        });

        if (!user || !user.hashed || !checkPassword(password, user.hashed, res)) {
            throw new Error("not found");
        }

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    });
}

async function checkPassword(password, hashedPassword, res) {
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (!passwordMatch) {
        throw new Error("Invalid password");
    }
    return true;
}

/* async function checkPassword(password, hashedPassword) {
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (!passwordMatch) {
        throw new Error("Invalid password");
    }

    return password === hashedPassword;
} */


const get = async (request, res) => {

    try {
        let result;

        await db.$transaction(async (db) => {

            result = await db.tbl_user.findUnique({
                where: {
                    email: request.email
                }
            });

            if (!result) {
                res.status(200).send(`user email ${request.email} not found`);
            }
        });

        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
}
const getall = async (id, res) => {
    const user = await db.tbl_user.findMany({
        select: {
            email: true,
            name: true,
            image: true,
            role: true,
            status_user: true
        },
        where: {
            status_user: true
        }
    });

    // Check apakah ada data petugas
    if (user.length === 0) {
        return res.status(404).json({ error: 'user not found' });
    }


    return user;
}
const update = async (request) => {

    const { username, password, email, hashad, name, image, status_user } = request;

    const user = await db.tbl_user.findUnique({
        where: {
            email: username
        },
    });

    if (!user || !user.hashed || !checkPassword(password, user.hashed)) {
        return null;
    }

    const totalContactInDatabase = await db.tbl_user.count({
        where: {
            email: email
        }
    });

    if (totalContactInDatabase !== 1) {
        return res.status(404).json({ error: 'not found' });
    }

    const passwords = await bcrypt.hash(hashad, 10);

    return db.tbl_user.update({
        where: {
            email: email,
        },
        data: {
            updated_at: formattedDate,
            email: email,
            name: name,
            hashed: passwords,
            image: image,
            status_user: status_user
        },
        select: {
            email: true,
            name: true,
        }
    })
}

const remove = async (id) => {
    // contactId = validate(getContactValidation, contactId);

    const totalInDatabase = await db.db.tbl_user.count({
        where: {
            // username: user.username,
            id: id
        }
    });

    if (totalInDatabase !== 1) {
        // throw new ResponseError(404, "contact is not found");
        return res.status(404).json({ error: 'not found' });
    }

    return db.db.tbl_user.delete({
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


    const harga_pupuk = await db.db.tbl_user.findMany({
        where: {
            OR: filters
        },
        take: parseInt(request.size), // Mengonversi request.size menjadi integer
        skip: skip
    });

    const totalItems = await db.db.tbl_user.count({
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
    createlog,
    login_user,
    get,
    getall,
    update,
    remove,
    search
}
