import { db } from "../application/database.js";
import { promisify } from 'util';
import { exec } from 'child_process';
const execPromisified = promisify(exec);
const today = new Date();
const formattedDate = today.toISOString();

const create = async (request, res) => {
    const {
        kode,
        kategori,
        tahun,
        harga_produk,
        kode_produk
    } = request;

    try {
        let newproduk;

        await db.$transaction(async (db) => {
            newproduk = await db.fact_harga_produk.create({
                data: {
                    created_at: formattedDate,
                    kode: kode,
                    kategori: kategori,
                    tahun: tahun,
                    harga_produk: harga_produk,
                    kode_produk: kode_produk,
                    status_harga_produk: true,
                },
            });
        });

        res.status(200).send(newproduk);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
};

const createbulk = async (request, res) => {
    const arrHarga = request; // Fix typo

    try {
        let newDistributorArray = [];

        await db.$transaction(async (db) => {
            for (let i = 0; i < arrHarga.length; i++) {
                const hargaData = arrHarga[i];

                const newGudang = await db.fact_distributor.create({
                    data: {
                        kode: hargaData.kode,
                        kategori: hargaData.kategori,
                        tahun: hargaData.tahun,
                        harga_produk: hargaData.harga_produk,
                        kode_produk: hargaData.kode_produk,
                        status_harga_produk: true,
                    },
                });
                newDistributorArray.push(newGudang);
            }
        });

        res.status(200).send(newDistributorArray);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
}

const update = async (request, res) => {

    const {
        id,
        kode,
        kategori,
        tahun,
        harga_produk,
        kode_produk,
        status_harga_produk
    } = request;

    try {
        let updatedData = null;

        await db.$transaction(async (db) => {

            const totalContactInDatabase = await db.fact_harga_produk.count({
                where: {
                    id: id
                }
            });

            if (totalContactInDatabase !== 1) {
                throw new Error('Data not found');
            }

            // Melakukan pembaruan data
            updatedData = await db.fact_harga_produk.update({
                where: {
                    id: id
                },
                data: {
                    updated_at: formattedDate,
                    kode: kode,
                    kategori: kategori,
                    tahun: tahun,
                    harga_produk: harga_produk,
                    kode_produk: kode_produk,
                    status_harga_produk: status_harga_produk,
                }
            });
        });

        res.status(200).send(updatedData);
    } catch (error) {
        res.status(500).send(`${error}`);
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

            const produk = await db.tbl_produk.findMany({
                select: {
                    id: true,
                    kode_produk: true,
                    nama_produk: true,
                    status_produk: true
                }
            });

            const hargapupuk = await db.tbl_harga_produk.findFirst({
                where: {
                    id: request.id
                },
                select: {
                    id: true,
                    kode_produk: true,
                    harga_produk: true,
                    tahun: true,
                    bulan: true,
                    kode_wilayah: true
                }
            });

            if (!hargapupuk) {
                throw new Error(`Harga pupuk not found`);
            }

            rekonstruksiData = {
                id: hargapupuk.id,
                kode_produk: hargapupuk.kode_produk,
                nama_produk: produk.nama_produk,
                harga_produk: hargapupuk.harga_produk,
                tahun: hargapupuk.tahun,
                bulan: hargapupuk.bulan,
                kode_wilayah: hargapupuk.kode_wilayah,
                nama_wilayah: wilayah.find(w => w.kode_wilayah === hargapupuk.kode_wilayah)?.nama || null
            };
        });

        res.status(200).send(rekonstruksiData);
    } catch (error) {
        res.status(500).send(`${error}`);
    }

    return rekonstruksiData;
} */
/* const get = async (request, res) => {

    const {
        tahun,
        kode,
        kategori,
        kode_produk
    } = request;

    try {

        let whereharga = {};

        if (tahun !== '' && tahun !== null) {
            whereharga.tahun = tahun;
        }
        if (kode !== '' && kode !== null) {
            whereharga.kode = kode;
        }
        if (kategori !== '' && kategori !== null) {
            whereharga.kategori = kategori;
        }

        const [provinsi, kabupaten, kecamatan, distributor, maparea, produk, hargaProduk] = await Promise.all([
            db.fact_provinsi.findMany({
                select: { id: true, kode_provinsi: true, nama_provinsi: true }
            }),
            db.fact_kab_kota.findMany({
                select: { id: true, kode_kab_kota: true, nama_kab_kota: true }
            }),
            db.fact_kecamatan.findMany({
                select: { id: true, kode_kecamatan: true, nama_kecamatan: true }
            }),
            db.fact_distributor.findMany({
                select: { id: true, kode_distributor: true, nama_distributor: true }
            }),
            db.fact_map_area.findMany({
                select: { id: true, kode_provinsi: true, kode_kab_kota: true, kode_kecamatan: true, kode_gudang: true, kode_distributor: true, kode_pengecer: true, kategori: true, tahun: true }
            }),
            db.fact_pupuk.findMany({
                select: { id: true, kode_produk: true, nama_produk: true }
            }),
            db.fact_harga_produk.findMany({
                where: whereharga,
                select: { id: true, kode: true, kategori: true, tahun: true, harga_produk: true, kode_produk: true }
            })
        ]);

        const allRekonstruksiData = hargaProduk.map(fact_harga_produk => {

            let nama_kategori = "";
            if (fact_harga_produk.kategori == "Provinsi") {

                nama_kategori = provinsi.find(pv => pv.kode_provinsi === fact_harga_produk.kode)?.nama_provinsi || null;
            }
            if (fact_harga_produk.kategori == "Kabupaten") {
                nama_kategori = kabupaten.find(kb => kb.kode_kab_kota === fact_harga_produk.kode)?.nama_kab_kota || null;
            }
            if (fact_harga_produk.kategori == "Kota") {
                nama_kategori = kabupaten.find(kb => kb.kode_kab_kota === fact_harga_produk.kode)?.nama_kab_kota || null;
            }
            if (fact_harga_produk.kategori == "Kecamatan") {
                nama_kategori = kecamatan.find(kc => kc.kode_kecamatan === fact_harga_produk.kode)?.nama_kecamatan || null;
            }
            if (fact_harga_produk.kategori == "Distributor") {
                nama_kategori = distributor.find(ds => ds.kode_distributor === fact_harga_produk.kode)?.nama_distributor || null;
            }
            const produkData = produk.find(pk => pk.kode_produk === fact_harga_produk.kode_produk)?.nama_produk || null;
            return {
                id: fact_harga_produk.id,
                kode: fact_harga_produk.kode,
                kategori: fact_harga_produk.kategori,
                nama_kategori: nama_kategori,
                kode_produk: fact_harga_produk.kode_produk,
                nama_produk: produkData,
                harga_produk: fact_harga_produk.harga_produk,
                tahun: fact_harga_produk.tahun
            };
        });

        res.status(200).send(allRekonstruksiData);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Terjadi kesalahan dalam pemrosesan data.");
    }
} */
const get = async (request, res) => {

    const {
        tahun,
        kode,
    } = request;

    try {
        let distributor;
        let alokasi;
        let produk;
        let provinsi;
        let kabupaten;
        let kecamatan;

        let filter = {
            keterangan: {
                in: ["Tebus", "Jual"]
            }
        };

        if (tahun != "" && tahun != null) {
            filter.tahun = tahun;
        }
        if (kode != "" && kode != null) {
            filter.kode = kode;
        }

        await db.$transaction(async (db) => {
            distributor = await db.fact_distributor.findMany();
            alokasi = await db.tbl_alokasi_penjualan.findMany({ where: filter, orderBy: { bulan: "asc" } });
            produk = await db.fact_pupuk.findMany();
            provinsi = await db.fact_provinsi.findMany();
            kabupaten = await db.fact_kab_kota.findMany();
            kecamatan = await db.fact_kecamatan.findMany();
        });

        const rekonstruksiData = alokasi.map(itemlokasi => {
            const bulan = parseInt(itemlokasi.bulan);
            const produkData = produk.find(itemproduk => itemproduk.kode_produk === itemlokasi.kode_produk);

            let nama_kategori = "";
            if (itemlokasi.kategori == "Provinsi") {

                nama_kategori = provinsi.find(pv => pv.kode_provinsi === itemlokasi.kode)?.nama_provinsi || null;
            }
            if (itemlokasi.kategori == "Kabupaten") {
                nama_kategori = kabupaten.find(kb => kb.kode_kab_kota === itemlokasi.kode)?.nama_kab_kota || null;
            }
            if (itemlokasi.kategori == "Kota") {
                nama_kategori = kabupaten.find(kb => kb.kode_kab_kota === itemlokasi.kode)?.nama_kab_kota || null;
            }
            if (itemlokasi.kategori == "Kecamatan") {
                nama_kategori = kecamatan.find(kc => kc.kode_kecamatan === itemlokasi.kode)?.nama_kecamatan || null;
            }
            if (itemlokasi.kategori == "Distributor") {
                nama_kategori = distributor.find(ds => ds.kode_distributor === itemlokasi.kode)?.nama_distributor || null;
            }

            const newData = {
                id: itemlokasi.id,
                kode: itemlokasi.kode,
                kategori: itemlokasi.kategori,
                nama_kategori: nama_kategori,
                besaran: itemlokasi.besaran,
                bulan: bulan,
                tahun: itemlokasi.tahun,
                keterangan: itemlokasi.keterangan,
                kode_produk: itemlokasi.kode_produk,
                produk: produkData ? produkData.nama_produk : null
            };
            return newData;
        });

        res.status(200).send(rekonstruksiData);
    } catch (error) {
        console.error(error); // Lakukan logging pesan kesalahan
        res.status(500).send("Terjadi kesalahan dalam memproses permintaan.");
    }
}
const getall = async (res) => {

    try {
        let allRekonstruksiData = [];

        await db.$transaction(async (db) => {
            const [wilayah, produk, hargaProduk] = await Promise.all([
                db.tbl_wilayah.findMany({
                    select: {
                        id: true,
                        kode: true,
                        nama: true,
                        kode_wilayah: true
                    }
                }),
                db.tbl_produk.findMany({
                    select: {
                        id: true,
                        kode_produk: true,
                        nama_produk: true,
                        status_produk: true
                    }
                }),
                db.tbl_harga_produk.findMany({
                    select: {
                        id: true,
                        kode_produk: true,
                        harga_produk: true,
                        tahun: true,
                        bulan: true,
                        kode_wilayah: true
                    }
                })
            ]);

            const wilayahMap = {};
            wilayah.forEach(w => {
                wilayahMap[w.kode_wilayah] = w;
            });

            allRekonstruksiData = hargaProduk.map(harga => {
                const currentWilayah = wilayahMap[harga.kode_wilayah];
                const namaProduk = produk.find(p => p.kode_produk === harga.kode_produk)?.nama_produk || null;

                return {
                    id: harga.id,
                    kode_produk: harga.kode_produk,
                    nama_produk: namaProduk,
                    harga_produk: harga.harga_produk,
                    tahun: harga.tahun,
                    bulan: harga.bulan,
                    kode_wilayah: harga.kode_wilayah,
                    nama_wilayah: currentWilayah ? currentWilayah.nama : null
                };
            });
        });

        res.status(200).send(allRekonstruksiData);

    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

const remove = async (request, res) => {

    try {
        let updatedproduk;

        await db.$transaction(async (db) => {

            const existingproduk = await db.fact_harga_produk.findUnique({
                where: {
                    id: request.id
                }
            });

            if (!existingproduk) {
                throw new Error('produk not found');
            }

            updatedproduk = await db.fact_harga_produk.update({
                where: {
                    id: request.id
                },
                data: {
                    deleted_at: formattedDate,
                    status_harga_produk: false,
                }
            });
        });

        res.status(200).send(updatedproduk);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}


export default {
    create,
    createbulk,
    get,
    getall,
    update,
    remove,
}
