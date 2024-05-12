import { db } from "../application/database.js";
import { promisify } from 'util';
import { exec } from 'child_process';
const execPromisified = promisify(exec);

const today = new Date();
const formattedDate = today.toISOString();

/* const create = async (request, res) => {
    const { kode_kios, nama_kios, longitude, latitude, kodeprov, provinsi, kodekab, kabupaten, kodekec, kecamatan, id_distributor, kode_distributor, status_kios, userid } = request;

    try {
        let newkios;

        await db.$transaction(async (db) => {
            newkios = await db.tbl_kios.create({
                data: {
                    created_at: formattedDate,
                    kode_kios: kode_kios,
                    nama_kios: nama_kios,
                    longitude: longitude,
                    latitude: latitude,
                    kodeprov: kodeprov,
                    provinsi: provinsi,
                    kodekab: kodekab,
                    kabupaten: kabupaten,
                    kodekec: kodekec,
                    kecamatan: kecamatan,
                    id_distributor: id_distributor,
                    kode_distributor: kode_distributor,
                    status_kios: status_kios,
                    userid: userid
                }
            });
        });

        res.status(200).send(newkios);

    } catch (error) {
        res.status(500).send(`${error}`);
    }

} */
const create = async (request, res) => {
    const {
        kode_pengecer,
        nama_pengecer,
        tahun,
        alamat,
        long,
        lat
    } = request; // Pastikan request telah di-parse dengan benar

    try {
        let newKios;

        await db.$transaction(async (db) => {
            const existingKios = await db.fact_kios.findUnique({
                where: {
                    kode_pengecer: kode_pengecer
                }
            });

            if (existingKios) {
                throw new Error('Kios already exists');
            }

            newKios = await db.fact_kios.create({
                data: {
                    kode_pengecer: kode_pengecer,
                    nama_pengecer: nama_pengecer,
                    tahun: tahun,
                    alamat: alamat,
                    long: long,
                    lat: lat
                },
            });
        });

        res.status(200).send(newKios);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
}
const createbulk = async (request, res) => {
    const arrKios = request; // Fix typo

    try {
        let newKiosArray = [];

        await db.$transaction(async (db) => {
            for (let i = 0; i < arrKios.length; i++) {
                const kiosData = arrKios[i];

                const newKios = await db.fact_kios.create({
                    data: {
                        kode_pengecer: kiosData.kode_pengecer,
                        nama_pengecer: kiosData.nama_pengecer,
                        tahun: kiosData.tahun,
                        alamat: kiosData.alamat,
                        long: kiosData.long,
                        lat: kiosData.lat
                    },
                });
                newKiosArray.push(newKios);
            }
        });

        res.status(200).send(newKiosArray);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
}
const update = async (request, res) => {

    const {
        id,
        kode_pengecer,
        nama_pengecer,
        tahun,
        alamat,
        long,
        lat
    } = request;

    try {
        let updateKios;
        await db.$transaction(async (db) => {
            const existingKios = await db.fact_kios.findUnique({
                where: {
                    id: id
                }
            });

            if (!existingKios) {
                throw new Error('pengecer not found');
            }

            updateKios = await db.fact_kios.update({
                where: {
                    id: id
                },
                data: {
                    kode_pengecer: kode_pengecer,
                    nama_pengecer: nama_pengecer,
                    tahun: tahun,
                    alamat: alamat,
                    long: long,
                    lat: lat
                }
            });
        });
        res.status(200).send(updateKios);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}
const remove = async (request, res) => {

    try {
        let updatedkios;

        await db.$transaction(async (db) => {
            const existingkios = await db.tbl_kios.findUnique({
                where: {
                    id: request.id
                }
            });

            if (!existingkios) {
                throw new Error('kios not found');
            }

            updatedkios = await db.tbl_kios.update({
                where: {
                    id: request.id
                },
                data: {
                    deleted_at: formattedDate,
                    status_kios: false,
                }
            });
        });

        res.status(200).send(updatedkios);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

/* const get = async (request, res) => {
    try {
        let rekonstruksiData;

        const wilayah = await db.tbl_wilayah.findMany({
            select: {
                id: true,
                kode: true,
                nama: true,
                kode_wilayah: true
            }
        });

        const kios = await db.tbl_kios.findFirst({
            where: {
                id: request.id
            },
            select: {
                id: true,
                kode_kios: true,
                nama_kios: true,
                longitude: true,
                latitude: true,
                kodeprov: true,
                kodekab: true,
                kodekec: true,
                id_distributor: true,
                kode_distributor: true,
                status_kios: true,
            }
        });

        if (!kios) {
            return res.status(404).send('Kios not found');
        }

        const distributorMap = new Map();
        const allDistributors = await db.tbl_distributor.findMany({
            select: {
                id: true,
                kode_distributor: true,
                nama_distributor: true,
                status_distributor: true
            }
        });

        allDistributors.forEach(distributor => {
            distributorMap.set(distributor.id, distributor);
            distributorMap.set(distributor.kode_distributor, distributor);
        });

        const distributor = distributorMap.get(kios.id_distributor) || distributorMap.get(kios.kode_distributor);

        rekonstruksiData = {
            id: kios.id,
            kode_kios: kios.kode_kios,
            nama_kios: kios.nama_kios,
            longitude: kios.longitude,
            latitude: kios.latitude,
            kodeprov: kios.kodeprov,
            provinsi: wilayah.find(w => w.kode_wilayah === kios.kodeprov)?.nama || null,
            kodekab: kios.kodekab,
            kabupaten: wilayah.find(w => w.kode_wilayah === kios.kodekab)?.nama || null,
            kodekec: kios.kodekec,
            kecamatan: wilayah.find(w => w.kode_wilayah === kios.kodekec)?.nama || null,
            id_distributor: kios.id_distributor,
            kode_distributor: kios.kode_distributor,
            nama_distributor: distributor?.nama_distributor || null,
            status_kios: kios.status_kios
        };

        res.status(200).send(rekonstruksiData);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
} */
/* const get = async (request, res) => {
    const { 
        kode, tahun
    } = request; // Pastikan request telah di-parse dengan benar

    try {
        let rekonstruksiData;

        // Membuat objek untuk filter
        let whereDist = {};
        if (kode !== '' && kode !== null) {
            whereDist.kode_pengecer = kode;
        }
        if (tahun !== '' && tahun !== null) {
            whereDist.tahun = tahun;
        }
        await db.$transaction(async (db) => {
            // Lakukan query untuk mendapatkan data distributor
            rekonstruksiData = await db.fact_kios.findMany({
                where: whereDist
            });
        });

        res.status(200).send(rekonstruksiData);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`); // Menambahkan pesan kesalahan yang lebih deskriptif
    }
} */
/* const get = async (request, res) => {
    const { kode, tahun } = request;

    try {
        let rekonstruksiData = [];
        let whereDist = {};
        if (kode !== '' && kode !== null) {
            whereDist.kode_pengecer = kode;
        }
        if (tahun !== '' && tahun !== null) {
            whereDist.tahun = tahun;
        }
        // Ambil data kios berdasarkan kode dan tahun
        const kiosData = await db.fact_kios.findMany({
            where: whereDist
        });

        // Loop melalui setiap entri kios
        for (const kios of kiosData) {
            // Ambil data file terkait dengan kios saat ini
            const fileData = await db.file_upload.findMany({
                where: {
                    kode: kios.kode_pengecer,
                    keterangan: "Kios"
                },
                select: {
                    name_file: true,
                    jenis_file: true,
                    uri: true
                }
            });

            // Buat objek kios baru yang juga berisi data file
            const kiosWithFile = {
                kode_pengecer: kios.kode_pengecer,
                nama_pengecer: kios.nama_pengecer,
                tahun: kios.tahun,
                alamat: kios.alamat,
                long: kios.long,
                lat: kios.lat,
                id: kios.id,
                file: fileData // Tambahkan data file ke dalam objek kios
            };

            // Tambahkan objek kios baru ke dalam array hasil
            rekonstruksiData.push(kiosWithFile);
        }

        res.status(200).send(rekonstruksiData);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
} */
const get = async (request, res) => {
    const { kode, tahun } = request;

    try {
        let rekonstruksiData = [];
        let whereKios = {};
        if (kode !== '' && kode !== null) {
            whereKios.kode_pengecer = kode;
        }
        if (tahun !== '' && tahun !== null) {
            whereKios.tahun = tahun;
        }
        // Ambil data gudang berdasarkan kode dan tahun
        const kiosData = await db.fact_kios.findMany({
            where: whereKios
        });

        // Loop melalui setiap entri gudang
        /*  for (const kios of kiosData) {
             // Ambil data file terkait dengan gudang saat ini
             let fileData = await db.file_upload.findMany({
                 where: {
                     kode: kios.kode_pengecer,
                     keterangan: "Kios"
                 },
                 select: {
                     name_file: true,
                     jenis_file: true,
                     uri: true
                 }
             });
 
             fileData = fileData.map(file => ({
                 name_file: file.name_file,
                 kategori: file.jenis_file,
                 uri: file.uri !== null ? file.uri : null
             }));
 
             if (fileData.length === 0) {
                 const nullUriFileData = await db.file_upload.findMany({
                     where: {
                         keterangan: "Kios"
                     },
                     select: {
                         name_file: true,
                         jenis_file: true
                     }
                 });
 
                 // Rekonstruksi data dengan uri null
                 fileData = nullUriFileData.map(file => ({
                     name_file: file.name_file,
                     kategori: file.jenis_file,
                     uri: null
                 }));
             }
 
             // Buat objek gudang baru yang juga berisi data file
             const kiosWithFile = {
                 kode_pengecer: kios.kode_pengecer,
                 nama_pengecer: kios.nama_pengecer,
                 tahun: kios.tahun,
                 alamat: kios.alamat, 
                 long: kios.long,
                 lat: kios.lat,
                 id: kios.id,
                 file: fileData // Tambahkan data file ke dalam objek gudang
             };
 
             // Tambahkan objek gudang baru ke dalam array hasil
             rekonstruksiData.push(kiosWithFile);
         }
 
         res.status(200).send(rekonstruksiData); */
        for (const kios of kiosData) {
            // Fetch file data related to the current gudang
            let fileData = await db.file_upload.findMany({
                where: {
                    kode: kios.kode_pengecer,
                    keterangan: "Kios"
                },
                select: {
                    name_file: true,
                    jenis_file: true,
                    uri: true
                }
            });

            // Restructure fileData to ensure entries for all categories
            const categorizedFiles = [
                { kategori: 'stokpupuk', uri: null, name_file: '' },
                { kategori: 'poktan', uri: null, name_file: '' },
                { kategori: 'daftarpetani', uri: null, name_file: '' },
                { kategori: 'penyaluran', uri: null, name_file: '' },
                { kategori: 'distributor', uri: null, name_file: '' },
                { kategori: 'spbj', uri: null, name_file: '' },
                { kategori: 'nib', uri: null, name_file: '' },
                { kategori: 'siup', uri: null, name_file: '' },
                { kategori: 'tdp', uri: null, name_file: '' },
                { kategori: 'rekomendasi', uri: null, name_file: '' }
            ];

            // Populate categorizedFiles with actual file data
            for (const file of fileData) {
                const categoryIndex = {
                    'stokpupuk': 0,
                    'poktan': 1,
                    'daftarpetani': 2,
                    'penyaluran': 3,
                    'distributor': 4,
                    'spbj': 5,
                    'nib': 6,
                    'siup': 7,
                    'tdp': 8,
                    'rekomendasi': 9
                }[file.jenis_file];

                if (categoryIndex !== undefined) {
                    categorizedFiles[categoryIndex] = {
                        kategori: file.jenis_file,
                        uri: file.uri !== null ? file.uri : null,
                        name_file: file.name_file
                    };
                }
            }

            // Push the gudang data with file data into rekonstruksiData
            rekonstruksiData.push({
                kode_pengecer: kios.kode_pengecer,
                nama_pengecer: kios.nama_pengecer,
                tahun: kios.tahun,
                alamat: kios.alamat,
                long: kios.long,
                lat: kios.lat,
                id: kios.id,
                file: categorizedFiles
            });
        }
        res.status(200).send(rekonstruksiData);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
}
const getall = async (res) => {
    try {
        let allRekonstruksiData = [];

        const wilayah = await db.tbl_wilayah.findMany({
            select: {
                id: true,
                kode: true,
                nama: true,
                kode_wilayah: true
            }
        });

        const allKios = await db.tbl_kios.findMany({
            select: {
                id: true,
                kode_kios: true,
                nama_kios: true,
                longitude: true,
                latitude: true,
                kodeprov: true,
                kodekab: true,
                kodekec: true,
                id_distributor: true,
                kode_distributor: true,
                status_kios: true,
            }
        });

        const distributorMap = new Map();
        const allDistributors = await db.tbl_distributor.findMany({
            select: {
                id: true,
                kode_distributor: true,
                nama_distributor: true,
                status_distributor: true
            }
        });

        allDistributors.forEach(distributor => {
            distributorMap.set(distributor.id, distributor);
            distributorMap.set(distributor.kode_distributor, distributor);
        });

        allRekonstruksiData = allKios.map(kios => {
            const distributor = distributorMap.get(kios.id_distributor) || distributorMap.get(kios.kode_distributor);

            return {
                id: kios.id,
                kode_kios: kios.kode_kios,
                nama_kios: kios.nama_kios,
                longitude: kios.longitude,
                latitude: kios.latitude,
                kodeprov: kios.kodeprov,
                provinsi: wilayah.find(w => w.kode_wilayah === kios.kodeprov)?.nama || null,
                kodekab: kios.kodekab,
                kabupaten: wilayah.find(w => w.kode_wilayah === kios.kodekab)?.nama || null,
                kodekec: kios.kodekec,
                kecamatan: wilayah.find(w => w.kode_wilayah === kios.kodekec)?.nama || null,
                id_distributor: kios.id_distributor,
                kode_distributor: kios.kode_distributor,
                nama_distributor: distributor?.nama_distributor || null,
                status_kios: kios.status_kios
            };
        });

        res.status(200).send(allRekonstruksiData);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}
const search = async (request, res) => {
    const skip = (request.page - 1) * parseInt(request.size);

    const filters = [];

    if (request.kode_kios) {
        filters.push({
            kode_kios: {
                contains: request.kode_kios
            }
        });
    }

    if (request.nama_kios) {
        filters.push({
            nama_kios: {
                contains: request.nama_kios
            }
        });
    }

    const kios = await db.tbl_kios.findMany({
        where: {
            OR: filters
        },
        take: parseInt(request.size),
        skip: skip
    });

    const totalItems = await db.tbl_kios.count({
        where: {
            OR: filters
        }
    });

    return {
        data: kios,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / parseInt(request.size))
        }
    }
}
export default {
    create,
    createbulk,
    get,
    getall,
    update,
    remove,
    search
}
