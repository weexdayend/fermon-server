import { db } from "../application/database.js";
import { promisify } from 'util';
import { exec } from 'child_process';
const execPromisified = promisify(exec);
const today = new Date();
const formattedDate = today.toISOString();

const create = async (request, res) => {
    const 
    { 
        kode_produk, 
        nama_produk, 
        tahun,
        tebus,
        jual 
    } = request;

    try {
        const existingProduk = await db.fact_pupuk.findUnique({
            where: {
                kode_produk: kode_produk,
                tahun: tahun 
            },
        });

        if (existingProduk) {
            res.status(200).send('Kode produk already exist');
        }

        let newproduk;

        await db.$transaction(async (db) => {

            newproduk = await db.fact_pupuk.create({
                data: {
                    kode_produk: kode_produk,
                    nama_produk: nama_produk,
                    tahun: tahun,
                    tebus: tebus,
                    jual: jual
                },
            });
        });

        res.status(200).send(newproduk);
    } catch (error) {
        res.status(500).send(`Internal Server Error ${error}`);
    }
};

const update = async (request, res) => {

    const 
    { 
        id,
        kode_produk, 
        nama_produk, 
        tahun,
        tebus,
        jual 
    } = request;

    try {
        
        const existingproduk = await db.fact_pupuk.findUnique({
            where: {
                id: id
            } 
        });

        if (!existingproduk) {
             res.status(404).send('Produk not found');
        }
 
        // Lakukan update data produk
        const updatedproduk = await db.fact_pupuk.update({
            where: {
                id: id
            },
            data: {
                kode_produk: kode_produk,
                nama_produk: nama_produk,
                tahun: tahun,
                tebus: tebus,
                jual: jual 
            } 
        });

        res.status(200).send(updatedproduk);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
} 

const get = async (request, res) => {
    try {
        let produk;
        await db.$transaction(async (db) => {
            produk = await db.tbl_produk.findUnique({
                where: {
                    id: request.id
                },
                select: {
                    id: true,
                    kode_produk: true,
                    nama_produk: true,
                    status_produk: true
                }
            });
            if (!produk) {
                res.status(404).send('Product not found');
            }
        });

        res.status(200).send(produk);
    } catch (error) {
        return res.status(500).send('Internal Server Error');
    }
}

const getall = async (request, res) => {
    const 
    { 
        id,
        kode, 
        nama_produk, 
        tahun 
    } = request;

    try {
        let produk;

        let filter = {};
        if (id !== '' && id !== null) {
            filter.id = id;
        }
        if (kode !== '' && kode !== null) {
            filter.kode_produk = kode;
        }
        if (nama_produk !== '' && nama_produk !== null) {
            filter.nama_produk = nama_produk;
        }
        if (tahun !== '' && tahun !== null) {
            filter.tahun = tahun;
        }

        await db.$transaction(async (db) => {
            produk = await db.fact_pupuk.findMany({
                where: filter 
            });
        });
        res.status(200).send(produk);
    } catch (error) {
        return res.status(500).send('Internal Server Error');
    }
}
 
const remove = async (request, res) => {
    try {
        // Validasi ID Produk
        const existingproduk = await db.tbl_produk.findUnique({
            where: {
                id: request.id
            },
            select: {
                id: true
            }
        });

        if (!existingproduk) {
            return res.status(404).send('Product not found');
        }

        // Lakukan penghapusan data produk
        const updatedproduk = await db.tbl_produk.update({
            where: {
                id: request.id
            },
            data: {
                status_produk: false,
            }
        });

        res.status(200).send(updatedproduk);
    } catch (error) {
        console.error('Error removing product:', error);
        res.status(500).send('Internal Server Error'); // Atau throw error sesuai kebutuhan
    }
}


const search = async (request) => {
    const skip = (request.page - 1) * parseInt(request.size);

    const filters = [];

    if (request.kode_produk) {
        filters.push({
            kode_produk: {
                contains: request.kode_produk
            }
        });
    }

    if (request.nama_produk) {
        filters.push({
            nama_produk: {
                contains: request.nama_produk
            }
        });
    }

    const produk = await db.tbl_produk.findMany({
        where: {
            OR: filters
        },
        take: parseInt(request.size),
        skip: skip
    });

    const totalItems = await db.tbl_produk.count({
        where: {
            OR: filters
        }
    });

    return {
        data: produk,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / parseInt(request.size))
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
