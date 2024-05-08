import { db } from "../application/database.js";
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { __dirname } from "../dirname.js";
const execPromisified = promisify(exec);
const today = new Date();
const formattedDate = today.toISOString();

/* const create = async (request, res) => {
    const { kode_gudang, nama_gudang, longitude, latitude, kodeprov, provinsi, kodekab, kabupaten, kodekec, kecamatan, status_gudang, userid } = request;

    try {
        let newGudang;

        await db.$transaction(async (db) => {
            newGudang = await db.tbl_gudang.create({
                data: {
                    created_at: formattedDate,
                    kode_gudang: kode_gudang,
                    nama_gudang: nama_gudang,
                    longitude: longitude,
                    latitude: latitude,
                    kodeprov: latitude,
                    provinsi: provinsi,
                    kodekab: kodekab,
                    kabupaten: kabupaten,
                    kodekec: kodekec,
                    kecamatan: kecamatan,
                    status_gudang: status_gudang,
                    userid: userid
                },
            });
        });

        res.status(200).send(newGudang);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
} */
const create = async (request, res) => {
    const {
        kode_gudang,
        nama_gudang,
        tahun,
        alamat,
        long,
        lat
    } = request; // Pastikan request telah di-parse dengan benar

    try {
        let newGudang;

        await db.$transaction(async (db) => {
            const existingGudang = await db.fact_gudang.findUnique({
                where: {
                    kode_gudang: kode_gudang
                }
            });

            if (existingGudang) {
                throw new Error('Gudang already exists');
            }

            newGudang = await db.fact_gudang.create({
                data: {
                    kode_gudang: kode_gudang,
                    nama_gudang: nama_gudang,
                    tahun: tahun,
                    alamat: alamat,
                    long: long,
                    lat: lat
                },
            });
        });

        res.status(200).send(newGudang);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
}
const createbulk = async (request, res) => {
    const arrGudang = request; // Fix typo

    try {
        let newGudangArray = [];

        await db.$transaction(async (db) => {
            for (let i = 0; i < arrGudang.length; i++) {
                const gudangData = arrGudang[i];

                const newGudang = await db.fact_gudang.create({
                    data: {
                        kode_gudang: gudangData.kode_gudang,
                        nama_gudang: gudangData.nama_gudang,
                        tahun: gudangData.tahun,
                        alamat: gudangData.alamat,
                        long: gudangData.long,
                        lat: gudangData.lat
                    },
                });
                newGudangArray.push(newGudang);
            }
        });

        res.status(200).send(newGudangArray);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`); // Menambahkan pesan kesalahan yang lebih deskriptif
    }
}

/* const get = async (request, res) => {

    try {
        let rekonstruksiData;

        await db.$transaction(async (db) => {

            const wilayah = await db.tbl_wilayah.findMany({
                select: {
                    id: true,
                    kode: true,
                    nama: true,
                    kode_wilayah: true
                }
            });

            const gudang = await db.tbl_gudang.findFirst({
                where: {
                    id: request.id
                },
                select: {
                    id: true,
                    kode_gudang: true,
                    nama_gudang: true,
                    longitude: true,
                    latitude: true,
                    kodeprov: true,
                    kodekab: true,
                    kodekec: true,
                    status_gudang: true,
                }
            });

            if (!gudang) {
                throw new Error(`Gudang with id ${request.id_gudang} not found`);
            }

            rekonstruksiData = {
                id: gudang.id,
                kode_gudang: gudang.kode_gudang,
                nama_gudang: gudang.nama_gudang,
                longitude: gudang.longitude,
                latitude: gudang.latitude,
                kodeprov: gudang.kodeprov,
                provinsi: wilayah.find(w => w.kode_wilayah === gudang.kodeprov)?.nama || null,
                kodekab: gudang.kodekab,
                kabupaten: wilayah.find(w => w.kode_wilayah === gudang.kodekab)?.nama || null,
                kodekec: gudang.kodekec,
                kecamatan: wilayah.find(w => w.kode_wilayah === gudang.kodekec)?.nama || null,
                status_gudang: gudang.status_gudang
            };
        });

        res.status(200).send(rekonstruksiData);

    } catch (error) {
        res.status(500).send(`${error}`);
    }

} */
/* const get = async (request, res) => {
    const {
        kode,
        tahun
    } = request;

    try {
        let rekonstruksiData;

        let whereDist = {};
        if (kode !== '' && kode !== null) {
            whereDist.kode_gudang = kode;
        }
        if (tahun !== '' && tahun !== null) {
            whereDist.tahun = tahun;
        }
        await db.$transaction(async (db) => {

            rekonstruksiData = await db.fact_gudang.findMany({
                where: whereDist
            });
        });

        res.status(200).send(rekonstruksiData);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
} */
const get = async (request, res) => {
    const { kode, tahun } = request;

    try {
        let rekonstruksiData = [];
        let whereDist = {};
        if (kode !== '' && kode !== null) {
            whereDist.kode_gudang = kode;
        }
        if (tahun !== '' && tahun !== null) {
            whereDist.tahun = tahun;
        }
        // Ambil data gudang berdasarkan kode dan tahun
        const gudangData = await db.fact_gudang.findMany({
            where: whereDist
        });

        // Loop melalui setiap entri gudang
        for (const gudang of gudangData) {
            // Ambil data file terkait dengan gudang saat ini
            const fileData = await db.file_upload.findMany({
                where: {
                    kode: gudang.kode_gudang,
                    keterangan: "Gudang"
                },
                select: {
                    name_file: true,
                    jenis_file: true,
                    uri: true
                }
            });

            // Buat objek gudang baru yang juga berisi data file
            const gudangWithFile = {
                kode_gudang: gudang.kode_gudang,
                nama_gudang: gudang.nama_gudang,
                tahun: gudang.tahun,
                alamat: gudang.alamat,
                pemilik: gudang.pemilik,
                phone_pemilik: gudang.phone_pemilik,
                pengelola: gudang.pengelola,
                kepala_gudang: gudang.kepala_gudang,
                phone_kepala_gudang: gudang.phone_kepala_gudang,
                long: gudang.long,
                lat: gudang.lat,
                id: gudang.id,
                file: fileData // Tambahkan data file ke dalam objek gudang
            };

            // Tambahkan objek gudang baru ke dalam array hasil
            rekonstruksiData.push(gudangWithFile);
        }

        res.status(200).send(rekonstruksiData);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
}

const getall = async (res) => {

    try {
        let allRekonstruksiData = [];

        await db.$transaction(async (db) => {

            const [wilayah, gudangs] = await Promise.all([
                db.tbl_wilayah.findMany({
                    select: {
                        id: true,
                        kode: true,
                        nama: true,
                        kode_wilayah: true
                    }
                }),
                db.tbl_gudang.findMany({
                    select: {
                        id: true,
                        kode_gudang: true,
                        nama_gudang: true,
                        longitude: true,
                        latitude: true,
                        kodeprov: true,
                        provinsi: true,
                        kodekab: true,
                        kabupaten: true,
                        kodekec: true,
                        kecamatan: true,
                        status_gudang: true
                    }
                })
            ]);

            allRekonstruksiData = gudangs.map(gudang => {
                const wilayahProvinsi = wilayah.find(w => w.kode_wilayah === gudang.kodeprov);
                const wilayahKabupaten = wilayah.find(w => w.kode_wilayah === gudang.kodekab);
                const wilayahKecamatan = wilayah.find(w => w.kode_wilayah === gudang.kodekec);

                return {
                    kode_gudang: gudang.kode_gudang,
                    nama_gudang: gudang.nama_gudang,
                    longitude: gudang.longitude,
                    latitude: gudang.latitude,
                    kodeprov: gudang.kodeprov,
                    provinsi: wilayahProvinsi ? wilayahProvinsi.nama : null,
                    kodekab: gudang.kodekab,
                    kabupaten: wilayahKabupaten ? wilayahKabupaten.nama : null,
                    kodekec: gudang.kodekec,
                    kecamatan: wilayahKecamatan ? wilayahKecamatan.nama : null,
                    status_gudang: gudang.status_gudang
                };
            });
        });

        res.status(200).send(allRekonstruksiData);

    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

const getprodusen = async (request, res) => {

    try {
        let rekonstruksiData;

        await db.$transaction(async (db) => {
            const [gudang, produsen] = await Promise.all([
                db.tbl_gudang.findFirst({
                    where: {
                        id: request.id
                    },
                    select: {
                        id: true,
                        nama_gudang: true,
                        kodeprov: true,
                        kodekab: true,
                        kodekec: true
                    }
                }),
                db.tbl_produsen.findMany({
                    where: {
                        id_gudang: request.id
                    },
                    select: {
                        id: true,
                        kode_produsen: true,
                        nama_produsen: true,
                        id_gudang: true,
                        status_produsen: true
                    }
                })
            ]);

            if (!gudang) {
                throw new Error('Gudang not found');
            }

            if (!produsen || produsen.length === 0) {
                throw new Error('No produsen found for this warehouse');
            }

            rekonstruksiData = produsen.map(p => ({
                kode_produsen: p.kode_produsen,
                nama_produsen: p.nama_produsen,
                id_gudang: p.id_gudang,
                nama_gudang: gudang.nama_gudang || null,
                status_produsen: p.status_produsen
            }));
        });
        res.status(200).send(rekonstruksiData);

    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

const getdistributor = async (request, res) => {

    try {
        let rekonstruksiData;

        await db.$transaction(async (db) => {
            const [gudang, wilayah, distributors] = await Promise.all([
                db.tbl_gudang.findFirst({
                    where: {
                        id: request.id
                    },
                    select: {
                        id: true,
                        nama_gudang: true,
                        kodeprov: true,
                        kodekab: true,
                        kodekec: true
                    }
                }),
                db.tbl_wilayah.findMany({
                    select: {
                        kode_wilayah: true,
                        nama: true
                    }
                }),
                db.tbl_distributor.findMany({
                    where: {
                        idgudang: request.id
                    },
                    select: {
                        id: true,
                        kode_gudang: true,
                        nama_gudang: true,
                        longitude: true,
                        latitude: true,
                        kodeprov: true,
                        kodekab: true,
                        kodekec: true,
                        idgudang: true,
                        status_distributor: true,
                    }
                })
            ]);

            if (!gudang) {
                throw new Error('Gudang not found');
            }

            const wilayahMap = {};
            wilayah.forEach(w => {
                wilayahMap[w.kode_wilayah] = w.nama;
            });

            rekonstruksiData = distributors.map(d => ({
                kode_gudang: d.kode_gudang,
                nama_gudang: d.nama_gudang,
                longitude: d.longitude,
                latitude: d.latitude,
                kodeprov: d.kodeprov,
                provinsi: wilayahMap[d.kodeprov] || null,
                kodekab: d.kodekab,
                kabupaten: wilayahMap[d.kodekab] || null,
                kodekec: d.kodekec,
                kecamatan: wilayahMap[d.kodekec] || null,
                idgudang: d.idgudang,
                nama_gudang: gudang.nama_gudang || null,
                status_distributor: d.status_distributor
            }));
        });

        res.status(200).send(rekonstruksiData);

    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

/* const update = async (request, res) => {
    try {
        let updatedgudang;

        await db.$transaction(async (db) => {
            const existinggudang = await db.tbl_gudang.findUnique({
                where: {
                    id: request.id
                }
            });

            // Jika gudang tidak ditemukan, lempar error
            if (!existinggudang) {
                throw new Error('gudang not found');
            }

            // Lakukan update data gudang
            updatedgudang = await db.tbl_gudang.update({
                where: {
                    id: request.id
                },
                data: {
                    updated_at: formattedDate,
                    kode_gudang: request.kode_gudang,
                    nama_gudang: request.nama_gudang,
                    longitude: request.longitude,
                    latitude: request.latitude,
                    kodeprov: request.kodeprov,
                    provinsi: request.provinsi,
                    kodekab: request.kodekab,
                    kabupaten: request.kabupaten,
                    kodekec: request.kodekec,
                    kecamatan: request.kecamatan,
                    status_gudang: request.status_gudang,
                    userid: request.userid
                },
                select: {
                    id: true,
                    kode_gudang: true,
                    nama_gudang: true,
                    longitude: true,
                    latitude: true,
                    kodeprov: true,
                    provinsi: true,
                    kodekab: true,
                    kabupaten: true,
                    kodekec: true,
                    kecamatan: true,
                    status_gudang: true,
                    userid: true
                }
            });
        });
        res.status(200).send(updatedgudang);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
} */
const update = async (request, res) => {

    const {
        id,
        kode_gudang,
        nama_gudang,
        tahun,
        alamat,
        long,
        lat
    } = request;

    try {
        let updateGudang;
        await db.$transaction(async (db) => {
            const existingGudang = await db.fact_gudang.findUnique({
                where: {
                    id: id
                }
            });

            if (!existingGudang) {
                throw new Error('distributor not found');
            }

            updateGudang = await db.fact_gudang.update({
                where: {
                    id: id
                },
                data: {
                    kode_gudang: kode_gudang,
                    nama_gudang: nama_gudang,
                    tahun: tahun,
                    alamat: alamat,
                    long: long,
                    lat: lat
                }
            });
        });
        res.status(200).send(updateGudang);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}
const remove = async (request, res) => {

    try {
        let updatedgudang;

        await db.$transaction(async (db) => {
            const existinggudang = await db.tbl_gudang.findUnique({
                where: {
                    id: request.id
                }
            });

            if (!existinggudang) {
                throw new Error('gudang not found');
            }

            updatedgudang = await db.tbl_gudang.update({
                where: {
                    id: request.id
                },
                data: {
                    deleted_at: formattedDate,
                    status_gudang: false,
                }
            });
        });
        res.status(200).send(updatedgudang);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

const search = async (request) => {
    const skip = (request.page - 1) * parseInt(request.size);

    const filters = [];

    if (request.kode_gudang) {
        filters.push({
            kode_gudang: {
                contains: request.kode_gudang
            }
        });
    }

    if (request.nama_gudang) {
        filters.push({
            nama_gudang: {
                contains: request.nama_gudang
            }
        });
    }

    const gudang = await db.tbl_gudang.findMany({
        where: {
            OR: filters
        },
        take: parseInt(request.size),
        skip: skip
    });

    const totalItems = await db.tbl_gudang.count({
        where: {
            OR: filters
        }
    });

    return {
        data: gudang,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / parseInt(request.size))
        }
    }
}
const upload = async (req, file, res) => {

    try {
        if (!file) {
            return res.status(400).json({ message: 'Invalid input. Please provide a file and tab identifier.' });
        }

        const today = new Date();
        const formattedDate = today.toISOString();
        const fileExtension = path.extname(file.originalname);

        const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
        const uniqueFileName = `${req.body.jenis_file}_file_${currentDate.replace(/\/|,|:|\s/g, '-')}${fileExtension}`;

        let uri_file = "";
        let destinationPath = "";
        if (req.body.jenis_file) {
            destinationPath = path.join(__dirname, `uploads/${req.body.jenis_file}`, uniqueFileName);
            uri_file = `/${req.body.jenis_file}/` + uniqueFileName;
        }

        const data = await fs.readFile(file.path);
        await fs.writeFile(destinationPath, data);

        const fileSize = file.size;

        // Ambil data gudang berdasarkan id
        const gudang = await db.fact_gudang.findUnique({
            where: {
                id: req.body.id
            }
        });

        let existingData = [];

        // Periksa jika ada data JSON di field file
        if (gudang && gudang.file) {
            // existingData = JSON.parse(gudang.file);
            existingData = gudang.file;
        }

        // Objek baru yang ingin ditambahkan
        const newObj = {
            "nama_file": req.body.name_file,
            "uri_file": uri_file,
            "size": fileSize,
            "upload_date": formattedDate
        };

        // Tambahkan objek baru ke dalam array JSON yang sudah ada
        existingData.push(newObj);

        // Ubah array objek kembali menjadi string JSON
        // const updatedData = JSON.stringify(existingData);

        // Update field file berdasarkan id gudang dengan data JSON yang telah diperbarui
        const savedFile = await db.fact_gudang.update({
            where: {
                id: req.body.id
            },
            data: {
                file: existingData,
            }
        });

        await fs.unlink(file.path);

        return res.status(200).json({ message: 'File uploaded and saved successfully!', fileName: uniqueFileName });
    } catch (error) {
        console.error('Error processing upload:', error);
        return res.status(500).json({ message: 'An error occurred while processing the upload.' });
    }
}

export default {
    create,
    createbulk,
    get,
    getall,
    getprodusen,
    getdistributor,
    update,
    remove,
    upload,
    search
}
