import { db } from "../application/database.js";
import { promisify } from 'util';
import { exec } from 'child_process';
const execPromisified = promisify(exec);
const today = new Date();
const formattedDate = today.toISOString();

const create = async (request, res) => {
    const { kode_produsen, nama_produsen, id_gudang, status_produsen } = request;

    try {
        let newProdusen;

        await db.$transaction(async (db) => {
            newProdusen = await db.tbl_produsen.create({
                data: {
                    created_at: formattedDate,
                    kode_produsen: kode_produsen,
                    nama_produsen: nama_produsen,
                    id_gudang: id_gudang,
                    status_produsen: status_produsen
                },
            });
        });

        res.status(200).send(newProdusen);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
};

const get = async (request, res) => {
    let rekonstruksiData;

    try {
        await db.$transaction(async (db) => {
            const produsen = await db.tbl_produsen.findFirst({
                where: {
                    id: request.id
                }
            });

            if (!produsen) {
                throw new Error(`produsen not found`);
            }

            const gudang = await db.tbl_gudang.findUnique({
                where: {
                    id: produsen.id_gudang
                },
                select: {
                    nama_gudang: true,
                    longitude: true,
                    latitude: true,
                    kodeprov: true,
                    kodekab: true,
                    kodekec: true
                }
            });

            const wilayah = await db.tbl_wilayah.findMany({
                where: {
                    OR: [
                        { kode_wilayah: gudang.kodeprov },
                        { kode_wilayah: gudang.kodekab },
                        { kode_wilayah: gudang.kodekec }
                    ]
                },
                select: {
                    nama: true
                }
            });

            rekonstruksiData = {
                id: produsen.id,
                kode_produsen: produsen.kode_produsen,
                nama_produsen: produsen.nama_produsen,
                id_gudang: produsen.id_gudang,
                nama_gudang: gudang.nama_gudang,
                longitude: gudang.longitude,
                latitude: gudang.latitude,
                kodeprov_gudang: gudang.kodeprov,
                provinsi_gudang: wilayah.find(w => w.kode_wilayah === gudang.kodeprov)?.nama || null,
                kodekab_gudang: gudang.kodekab,
                kabupaten_gudang: wilayah.find(w => w.kode_wilayah === gudang.kodekab)?.nama || null,
                kodekec_gudang: gudang.kodekec,
                kecamatan_gudang: wilayah.find(w => w.kode_wilayah === gudang.kodekec)?.nama || null
            };
        });

        res.status(200).send(rekonstruksiData);
    } catch (error) {
        res.status(500).send(`${error}`);
    }

    return rekonstruksiData;
};

const getall = async (res) => {
    let rekonstruksiData;

    try {
        await db.$transaction(async (db) => {
            // Mendapatkan semua data produsen
            const allProdusen = await db.tbl_produsen.findMany();

            // Memastikan ada data produsen yang ditemukan
            if (!allProdusen || allProdusen.length === 0) {
                throw new Error(`No produsen found`);
            }

            // Menginisialisasi array untuk menyimpan data produsen yang direkonstruksi
            const produsenData = [];

            // Loop melalui setiap produsen untuk mengambil detail gudang dan wilayah
            for (const produsen of allProdusen) {
                // Mendapatkan detail gudang
                const gudang = await db.tbl_gudang.findUnique({
                    where: {
                        id: produsen.id_gudang
                    },
                    select: {
                        nama_gudang: true,
                        longitude: true,
                        latitude: true,
                        kodeprov: true,
                        kodekab: true,
                        kodekec: true
                    }
                });

                // Mendapatkan detail wilayah
                const wilayah = await db.tbl_wilayah.findMany({
                    where: {
                        OR: [
                            { kode_wilayah: gudang.kodeprov },
                            { kode_wilayah: gudang.kodekab },
                            { kode_wilayah: gudang.kodekec }
                        ]
                    },
                    select: {
                        nama: true
                    }
                });

                // Menyusun data produsen yang direkonstruksi
                const produsenDataItem = {
                    id: produsen.id,
                    kode_produsen: produsen.kode_produsen,
                    nama_produsen: produsen.nama_produsen,
                    id_gudang: produsen.id_gudang,
                    nama_gudang: gudang.nama_gudang,
                    longitude: gudang.longitude,
                    latitude: gudang.latitude,
                    kodeprov_gudang: gudang.kodeprov,
                    provinsi_gudang: wilayah.find(w => w.kode_wilayah === gudang.kodeprov)?.nama || null,
                    kodekab_gudang: gudang.kodekab,
                    kabupaten_gudang: wilayah.find(w => w.kode_wilayah === gudang.kodekab)?.nama || null,
                    kodekec_gudang: gudang.kodekec,
                    kecamatan_gudang: wilayah.find(w => w.kode_wilayah === gudang.kodekec)?.nama || null
                };

                // Menambahkan data produsen ke dalam array
                produsenData.push(produsenDataItem);
            }

            // Mengirim data produsen yang direkonstruksi sebagai respons
            res.status(200).send(produsenData);
        });
    } catch (error) {
        // Mengirim respons error jika terjadi kesalahan
        res.status(500).send(`${error}`);
    }
}

const update = async (request, res) => {
    const { kode_produsen, nama_produsen, id_gudang, status_produsen } = request;
    try {

        let updatedprodusen;

        await db.$transaction(async (db) => {
            const existingprodusen = await db.tbl_produsen.findUnique({
                where: {
                    id: request.id
                }
            });

            // Jika produsen tidak ditemukan, lempar error
            if (!existingprodusen) {
                throw new Error('produsen not found');
            }

            // Lakukan update data produsen
            updatedprodusen = await db.tbl_produsen.update({
                where: {
                    id: request.id
                },
                data: {
                    updated_at: formattedDate,
                    kode_produsen: kode_produsen,
                    nama_produsen: nama_produsen,
                    id_gudang: id_gudang,
                    status_produsen: status_produsen,
                },
                select: {
                    id: true,
                    kode_produsen: true,
                    nama_produsen: true,
                    id_gudang: true,
                    status_produsen: true,
                }
            });
        });

        res.status(200).send(updatedprodusen);

    } catch (error) {
        // Mengirim respons error jika terjadi kesalahan
        res.status(500).send(`${error}`);
    }


}

const remove = async (request, res) => {
    const { id } = request;
    try {
        let updatedprodusen;

        await db.$transaction(async (db) => {
            const existingprodusen = await db.tbl_produsen.findUnique({
                where: {
                    id: id
                }
            });

            if (!existingprodusen) {
                throw new Error('produsen not found');
            }

            updatedprodusen = await db.tbl_produsen.update({
                where: {
                    id: id
                },
                data: {
                    deleted_at: formattedDate,
                    status_produsen: false,
                }
            });
        });

        res.status(200).send(updatedprodusen);
    } catch (error) {
        // Mengirim respons error jika terjadi kesalahan
        res.status(500).send(`${error}`);
    }

}

const search = async (request) => {
    const skip = (request.page - 1) * parseInt(request.size);

    const filters = [];

    if (request.kode_produsen) {
        filters.push({
            kode_produsen: {
                contains: request.kode_produsen
            }
        });
    }

    if (request.nama_produsen) {
        filters.push({
            nama_produsen: {
                contains: request.nama_produsen
            }
        });
    }

    const produsen = await db.tbl_produsen.findMany({
        where: {
            OR: filters
        },
        take: parseInt(request.size),
        skip: skip
    });

    const totalItems = await db.tbl_produsen.count({
        where: {
            OR: filters
        }
    });

    return {
        data: produsen,
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
