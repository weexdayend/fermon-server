import { db } from "../application/database.js";
import { promisify } from 'util';
import { exec } from 'child_process';
const execPromisified = promisify(exec);
const today = new Date();
const formattedDate = today.toISOString();

const formatbulan = (today.getMonth() + 1).toString(); // Mengonversi bulan ke string
const formattahun = today.getFullYear().toString(); // Mengonversi tahun ke string

const create = async (request, res) => {
    const {
        kode_distributor,
        nama_distributor,
        tahun,
        alamat,
        long,
        lat,
        pemilik,
        pengelola,
        tlp,
    } = request; // Pastikan request telah di-parse dengan benar

    try {
        let newDistributor;

        await db.$transaction(async (db) => {
            const existingDistributor = await db.fact_distributor.findUnique({
                where: {
                    kode_distributor: kode_distributor
                }
            });

            if (existingDistributor) {
                throw new Error('Distributor already exists');
            }

            newDistributor = await db.fact_distributor.create({
                data: {
                    kode_distributor: kode_distributor,
                    nama_distributor: nama_distributor,
                    tahun: tahun,
                    alamat: alamat,
                    long: long,
                    lat: lat,
                    pemilik: pemilik,
                    pengelola: pengelola,
                    tlp: tlp,
                },
            });
        });

        res.status(200).send(newDistributor);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
}

const createbulk = async (request, res) => {
    const arrDistributor = request; // Fix typo

    try {
        let newDistributorArray = [];

        await db.$transaction(async (db) => {
            for (let i = 0; i < arrDistributor.length; i++) {
                const distributorData = arrDistributor[i];

                const newGudang = await db.fact_distributor.create({
                    data: {
                        kode_distributor: distributorData.kode_distributor,
                        nama_distributor: distributorData.nama_distributor,
                        tahun: distributorData.tahun,
                        alamat: distributorData.alamat,
                        long: distributorData.long,
                        lat: distributorData.lat,
                        pemilik: distributorData.pemilik,
                        pengelola: distributorData.pengelola,
                        tlp: distributorData.tlp,
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
        kode_distributor,
        nama_distributor,
        tahun,
        alamat,
        long,
        lat,
        pemilik,
        pengelola,
        tlp
    } = request;

    try {
        let updateddistributor;
        await db.$transaction(async (db) => {
            const existingdistributor = await db.fact_distributor.findUnique({
                where: {
                    id: id
                }
            });

            if (!existingdistributor) {
                throw new Error('distributor not found');
            }

            updateddistributor = await db.fact_distributor.update({
                where: {
                    id: id
                },
                data: {
                    kode_distributor: kode_distributor,
                    nama_distributor: nama_distributor,
                    tahun: tahun,
                    alamat: alamat,
                    long: long,
                    lat: lat,
                    pemilik: pemilik,
                    pengelola: pengelola,
                    tlp: tlp,
                }
            });
        });
        res.status(200).send(updateddistributor);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

const remove = async (request, res) => {

    try {

        let updateddistributor;

        await db.$transaction(async (db) => {
            const existingdistributor = await db.tbl_distributor.findUnique({
                where: {
                    id: request.id
                }
            });

            if (!existingdistributor) {
                throw new Error('distributor not found');
            }

            updateddistributor = await db.tbl_distributor.update({
                where: {
                    id: request.id
                },
                data: {
                    deleted_at: formattedDate,
                    status_distributor: false,
                }
            });
        });

        res.status(200).send(updateddistributor);
    } catch (error) {
        res.status(500).send(`${error}`);
    }

}
// const create = async (request, res) => {
//     const { 
//         kode_distributor, 
//         nama_distributor, 
//         longitude, 
//         latitude, 
//         kodeprov, 
//         provinsi, 
//         kodekab, 
//         kabupaten, 
//         kodekec, 
//         kecamatan, 
//         id_gudang, 
//         status_distributor, 
//         userid } = request;

//     try {
//         let newdistributor;

//         await db.$transaction(async (db) => {
//             newdistributor = await db.tbl_distributor.create({
//                 data: {
//                     created_at: formattedDate,
//                     kode_distributor: kode_distributor,
//                     nama_distributor: nama_distributor,
//                     longitude: longitude,
//                     latitude: latitude,
//                     kodeprov: kodeprov,
//                     provinsi: provinsi,
//                     kodekab: kodekab,
//                     kabupaten: kabupaten,
//                     kodekec: kodekec,
//                     kecamatan: kecamatan,
//                     id_gudang: id_gudang,
//                     status_distributor: status_distributor,
//                     userid: userid
//                 },
//             });
//         });

//         res.status(200).send(newdistributor);
//     } catch (error) {
//         res.status(500).send(`${error}`);
//     }
// }
/* const get = async (request, res) => {
    const { 
        kode, 
        tahun
    } = request; // Pastikan request telah di-parse dengan benar

    try {
        let rekonstruksiData;

        // Membuat objek untuk filter
        let whereDist = {};
        if (kode !== '' && kode !== null) {
            whereDist.kode_distributor = kode;
        }
        if (tahun !== '' && tahun !== null) {
            whereDist.tahun = tahun;
        }
        await db.$transaction(async (db) => {
            // Lakukan query untuk mendapatkan data distributor
            rekonstruksiData = await db.fact_distributor.findMany({
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
            whereDist.kode_distributor = kode;
        }
        if (tahun !== '' && tahun !== null) {
            whereDist.tahun = tahun;
        }
        // Ambil data gudang berdasarkan kode dan tahun
        const distributorData = await db.fact_distributor.findMany({
            where: whereDist
        });

        // Loop melalui setiap entri gudang
        for (const distributor of distributorData) {
            // Ambil data file terkait dengan gudang saat ini
            const fileData = await db.file_upload.findMany({
                where: {
                    kode: distributor.kode_distributor,
                    keterangan: "Distributor"
                },
                select: {
                    name_file: true,
                    jenis_file: true,
                    uri: true
                }
            });

            // Buat objek gudang baru yang juga berisi data file
            const distributorWithFile = {
                kode_distributor: distributor.kode_distributor,
                nama_distributor: distributor.nama_distributor,
                tahun: distributor.tahun,
                alamat: distributor.alamat,
                long: distributor.long,
                lat: distributor.lat,
                id: distributor.id,
                file: fileData // Tambahkan data file ke dalam objek gudang
            };

            // Tambahkan objek gudang baru ke dalam array hasil
            rekonstruksiData.push(distributorWithFile);
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
        let whereDistibutor = {};
        if (kode !== '' && kode !== null) {
            whereDistibutor.kode_distributor = kode;
        }
        if (tahun !== '' && tahun !== null) {
            whereDistibutor.tahun = tahun;
        }
        // Ambil data gudang berdasarkan kode dan tahun
        const distributorData = await db.fact_distributor.findMany({
            where: whereDistibutor
        });

        // Loop melalui setiap entri gudang
        for (const distributor of distributorData) {
            // Ambil data file terkait dengan gudang saat ini
            let fileData = await db.file_upload.findMany({
                where: {
                    kode: distributor.kode_distributor,
                    keterangan: "Distributor"
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
                        keterangan: "Distributor"
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
            const distributorWithFile = {
                kode_distributor: distributor.kode_distributor,
                nama_distributor: distributor.nama_distributor,
                tahun: distributor.tahun,
                alamat: distributor.alamat,
                pemilik: distributor.pemilik,
                pengelola: distributor.pengelola,
                tlp: distributor.tlp,
                long: distributor.long,
                lat: distributor.lat,
                id: distributor.id,
                file: fileData // Tambahkan data file ke dalam objek gudang
            };

            // Tambahkan objek gudang baru ke dalam array hasil
            rekonstruksiData.push(distributorWithFile);
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
            const [wilayah, gudang, distributors] = await Promise.all([
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
                }),
                db.tbl_distributor.findMany({
                    select: {
                        id: true,
                        kode_distributor: true,
                        nama_distributor: true,
                        longitude: true,
                        latitude: true,
                        kodeprov: true,
                        kodekab: true,
                        kodekec: true,
                        id_gudang: true,
                        status_distributor: true,
                    }
                })
            ]);

            allRekonstruksiData = distributors.map(distributor => {
                const wilayahProvinsi = wilayah.find(w => w.kode_wilayah === distributor.kodeprov);
                const wilayahKabupaten = wilayah.find(w => w.kode_wilayah === distributor.kodekab);
                const wilayahKecamatan = wilayah.find(w => w.kode_wilayah === distributor.kodekec);
                const gudangDistributor = gudang.find(g => g.id === distributor.id_gudang);

                return {
                    kode_distributor: distributor.kode_distributor,
                    nama_distributor: distributor.nama_distributor,
                    longitude: distributor.longitude,
                    latitude: distributor.latitude,
                    kodeprov: distributor.kodeprov,
                    provinsi: wilayahProvinsi ? wilayahProvinsi.nama : null,
                    kodekab: distributor.kodekab,
                    kabupaten: wilayahKabupaten ? wilayahKabupaten.nama : null,
                    kodekec: distributor.kodekec,
                    kecamatan: wilayahKecamatan ? wilayahKecamatan.nama : null,
                    id_gudang: distributor.id_gudang,
                    nama_gudang: gudangDistributor ? gudangDistributor.nama_gudang : null,
                    status_distributor: distributor.status_distributor
                };
            });
        });

        res.status(200).send(allRekonstruksiData);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

const getkios = async (request, res) => {

    try {
        let rekonstruksiData;

        await db.$transaction(async (db) => {
            const [distributor, wilayah, kios] = await Promise.all([
                db.tbl_distributor.findFirst({
                    where: {
                        id: request.id
                    },
                    select: {
                        id: true,
                        nama_distributor: true,
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
                db.tbl_kios.findMany({
                    where: {
                        id_distributor: request.id
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
                        status_kios: true,
                    }
                })
            ]);

            if (!distributor) {
                throw new Error('distributor not found');
                // res.status(200).send({'distributor not found'});
            }

            if (!kios || kios.length === 0) {
                throw new Error('no kios found for this distributor');
                // res.status(200).send('no kios found for this distributor');
            }

            const wilayahMap = wilayah.reduce((acc, curr) => {
                acc[curr.kode_wilayah] = curr.nama;
                return acc;
            }, {});

            rekonstruksiData = kios.map(k => ({
                kode_kios: k.kode_kios,
                nama_kios: k.nama_kios,
                longitude: k.longitude,
                latitude: k.latitude,
                kodeprov: k.kodeprov,
                provinsi: wilayahMap[k.kodeprov] || null,
                kodekab: k.kodekab,
                kabupaten: wilayahMap[k.kodekab] || null,
                kodekec: k.kodekec,
                kecamatan: wilayahMap[k.kodekec] || null,
                id_distributor: k.id_distributor,
                nama_distributor: distributor.nama_distributor || null,
                status_kios: k.status_kios
            }));
        });

        res.status(200).send(rekonstruksiData);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}
// const getalldistributorsum = async (request, res) => {
//     const { kode } = request
//     try {
//         let mapping_profile;
//         let fact_wilayah;
//         let fact_profile;
//         let lokasi;

//         let whereprofile = {
//             kategori: "Distributor"
//         };

//         if (kode !== '' || kode !== null) {
//             whereprofile.kode = kode;
//         }

//         await db.$transaction(async (db) => {
//             mapping_profile = await db.mapping_profile.findMany({
//                 where: {
//                     NOT: {
//                         id_distributor: {
//                             equals: null,
//                             equals: ""
//                         }
//                     }
//                 }
//             });
//             fact_wilayah = await db.fact_wilayah.findMany();
//             fact_profile = await db.fact_profile.findMany({
//                 where: whereprofile
//             });
//             lokasi = await db.tbl_alokasi_penjualan.findMany();
//         });

//         // Membentuk ulang data sesuai dengan format yang diinginkan
//         const rekonstruksiData = fact_profile.map(profile => {
//             // Cari data mapping_profile sesuai dengan id_mapping pada profil saat ini
//             const mappingData = mapping_profile.find(item => item.id_distributor === profile.kode);

//             // Inisialisasi objek untuk menyimpan informasi wilayah
//             let wilayahInfo = {
//                 id_provinsi: "",
//                 provinsi: "",
//                 id_kabupaten: "",
//                 kabupaten: "",
//                 id_kecamatan: "",
//                 kecamatan: ""
//             };

//             // Jika data mapping ditemukan, cari informasi wilayah dari fact_wilayah
//             if (mappingData) {
//                 wilayahInfo = {
//                     id_provinsi: mappingData.id_provinsi,
//                     provinsi: fact_wilayah.find(item => item.kode === mappingData.id_provinsi)?.nama || "",
//                     id_kabupaten: mappingData.id_kabupaten,
//                     kabupaten: fact_wilayah.find(item => item.kode === mappingData.id_kabupaten)?.nama || "",
//                     id_kecamatan: mappingData.id_kecamatan,
//                     kecamatan: fact_wilayah.find(item => item.kode === mappingData.id_kecamatan)?.nama || ""
//                 };
//             }

//             // Filter lokasi berdasarkan kode distributor dan hitung total nominal per bulan
//             const totalNominalPerBulan = lokasi.reduce((accumulator, currentValue) => {
//                 if (currentValue.kode_distributor === profile.kode) {
//                     if (!accumulator[currentValue.bulan]) {
//                         accumulator[currentValue.bulan] = 0;
//                     }

//                     accumulator[currentValue.bulan] += currentValue.nominal;
//                 }
//                 return accumulator;
//             }, {});

//             // Menghitung total nominal dari semua bulan
//             const totalNominal = Object.values(totalNominalPerBulan).reduce((sum, value) => sum + parseInt(value), 0);

//             return {
//                 id: profile.kode,
//                 // created_at: profile.created_at,
//                 // updated_at: profile.updated_at,
//                 // deleted_at: profile.deleted_at,
//                 kategori: profile.kategori,
//                 kode: profile.kode,
//                 nama: profile.nama,
//                 alamat: profile.alamat,
//                 ...wilayahInfo,
//                 status: profile.status,
//                 // id_mapping: profile.id_mapping,
//                 // nominal: totalNominal,
//                 nominal_yearly: 500000,
//                 nominal_curr_month: 500000,
//                 nominal_m: 500000,
//             };
//         });

//         res.status(200).send(rekonstruksiData);
//     } catch (error) {
//         res.status(500).send(`${error}`);
//     } 
// }

/* const getalldistributorsum = async (request, res) => {
    const { kode } = request
    try {
        let mapping_profile;
        let fact_wilayah;
        let fact_profile;
        let lokasi;
        let produk;

        let whereprofile = {
            kategori: "Distributor"
        };

        if (kode !== '' && kode !== null) {
            whereprofile.kode = kode;
        }

        await db.$transaction(async (db) => {
            mapping_profile = await db.fact_map_area.findMany({
                where: {
                    NOT: {
                        kode_distributor: {
                            equals: null,
                            equals: ""
                        }
                    }
                }
            });
            fact_wilayah = await db.fact_wilayah.findMany();
            fact_profile = await db.fact_profile.findMany({
                where: whereprofile
            });
            lokasi = await db.tbl_alokasi_penjualan.findMany();
            produk = await db.fact_pupuk.findMany();
        });

        // Mengambil tanggal hari ini untuk referensi bulan dan tahun berjalan
        const today = new Date();
        const formattahun = today.getFullYear().toString();
        const formatbulan = (today.getMonth() + 1).toString();

        // Fungsi untuk menghitung total nominal untuk tahun berjalan
        const hitungTotalNominalYearly = (lokasi, tahun, kode) => {
            return lokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && currentValue.kode_distributor === kode && currentValue.kode_produk === currentValue.kode_produk) {
                    accumulator += parseFloat(currentValue.nominal);
                }
                return accumulator;
            }, 0);
        };

        // Fungsi untuk menghitung total nominal untuk bulan berjalan pada tahun berjalan
        const hitungTotalNominalCurrMonth = (lokasi, tahun, bulan, kode) => {
            return lokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && alokasiDate.getMonth() + 1 === bulan && currentValue.kode_distributor === kode) {
                    accumulator += parseFloat(currentValue.nominal);
                }
                return accumulator;
            }, 0);
        };

        // Fungsi untuk menghitung total nominal untuk bulan Januari sampai bulan berjalan pada tahun berjalan
        const hitungTotalNominalMTM = (lokasi, tahun, bulan, kode) => {
            return lokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && parseInt(currentValue.bulan) <= bulan && currentValue.kode_distributor === kode) {
                    accumulator += parseFloat(currentValue.nominal);
                }
                return accumulator;
            }, 0);
        };

        // Membentuk ulang data sesuai dengan format yang diinginkan
        const rekonstruksiData = lokasi.reduce((accumulator, currentValue) => {
            // Find the corresponding profile for the current lokasiItem
            const profile = fact_profile.find(profileItem => profileItem.kode === currentValue.kode_distributor);

            if (profile) {
                // Find the corresponding mappingData for the current profile
                const mappingData = mapping_profile.find(item => item.id_distributor === profile.kode);

                // Inisialisasi objek untuk menyimpan informasi wilayah
                let wilayahInfo = {
                    id_provinsi: "",
                    provinsi: "",
                    id_kabupaten: "",
                    kabupaten: "",
                    id_kecamatan: "",
                    kecamatan: ""
                };

                // Jika data mapping ditemukan, cari informasi wilayah dari fact_wilayah
                if (mappingData) {
                    wilayahInfo = {
                        id_provinsi: mappingData.id_provinsi,
                        provinsi: fact_wilayah.find(item => item.kode === mappingData.id_provinsi)?.nama || "",
                        id_kabupaten: mappingData.id_kabupaten,
                        kabupaten: fact_wilayah.find(item => item.kode === mappingData.id_kabupaten)?.nama || "",
                        id_kecamatan: mappingData.id_kecamatan,
                        kecamatan: fact_wilayah.find(item => item.kode === mappingData.id_kecamatan)?.nama || ""
                    };
                }

                // Find the corresponding produkData for the current lokasiItem
                const produkData = produk.find(item => item.kode_produk === currentValue.kode_produk);

                let produkInfo = {
                    nama_produk: "",
                    kode_produk: ""
                };

                if (produkData) {
                    produkInfo = {
                        nama_produk: produkData.nama_produk,
                        kode_produk: produkData.kode_produk
                    };
                }

                // Menggunakan fungsi-fungsi di atas untuk menghitung total nominal
                const yearly = hitungTotalNominalYearly([currentValue], formattahun, profile.kode);
                const curr_month = hitungTotalNominalCurrMonth([currentValue], formattahun, parseInt(formatbulan), profile.kode);
                const mtm = hitungTotalNominalMTM([currentValue], formattahun, parseInt(formatbulan), profile.kode);

                // Generate key for grouping
                const groupKey = `${currentValue.keterangan}_${currentValue.kode_produk}_${currentValue.kode_distributor}_${currentValue.tahun}`;

                // Check if the group already exists, if not, create a new one
                if (!accumulator[groupKey]) {
                    accumulator[groupKey] = {
                        id: profile.kode,
                        kategori: profile.kategori,
                        kode: profile.kode,
                        nama: profile.nama,
                        alamat: profile.alamat,
                        ...wilayahInfo,
                        status: profile.status,
                        keterangan: currentValue.keterangan,
                        kode_produk: currentValue.kode_produk,
                        kode_distributor: currentValue.kode_distributor,
                        tahun: currentValue.tahun,
                        yearly: yearly,
                        curr_month: curr_month,
                        mtm: mtm,
                        ...produkInfo
                    };
                } else {
                    // If the group already exists, update the aggregate values
                    accumulator[groupKey].yearly += yearly;
                    accumulator[groupKey].curr_month += curr_month;
                    accumulator[groupKey].mtm += mtm;
                }
            }

            return accumulator;
        }, {});

        // Convert the grouped data object into an array of values
        const resultArray = Object.values(rekonstruksiData);

        res.status(200).send(resultArray);

    } catch (error) {
        res.status(500).send(`${error}`);
    }
} */

/* const getsumwilayah = async (request, res) => {
    const { 
        kode, 
        kode_provinsi, 
        kode_kab_kota, 
        kode_kecamatans 
    } = request
    try {
        // let mapping_profile;
        // let fact_wilayah;
        // let fact_profile;
        // let lokasi;
        // let produk;
        let mapping_profile;
        // let fact_wilayah;
        let fact_wilayah_prov;
        let fact_wilayah_kab;
        let fact_wilayah_kec;
        let fact_profile;
        let alokasi;
        let produk;

        let whereprofile = {
            kategori: "Distributor"
        };

        let wheremapping = {
            kategori: "Distributor",
            NOT: {
                id_distributor: {
                    equals: null,
                    equals: ""
                }
            }
        };

        if (kode !== '' && kode !== null) {
            whereprofile.kode = kode;
        }

        if (kode !== '' && kode !== null) {
            wheremapping.id_distributor = kode;
        }
        if (kode_prov !== '' && kode_prov !== null) {
            wheremapping.id_provinsi = kode_prov;
        }
        if (kode_kab !== '' && kode_kab !== null) {
            wheremapping.id_kabupaten = kode_kab;
        }
        if (kode_kec !== '' && kode_kec !== null) {
            wheremapping.id_kecamatan = kode_kec;
        }

        await db.$transaction(async (db) => {
            mapping_profile = await db.mapping_profile.findMany({
                where: wheremapping
            });
            fact_wilayah = await db.fact_wilayah.findMany();
            fact_profile = await db.fact_profile.findMany({
                where: whereprofile
            });
            lokasi = await db.tbl_alokasi_penjualan.findMany();
            produk = await db.fact_pupuk.findMany();
        });

        // Mengambil tanggal hari ini untuk referensi bulan dan tahun berjalan
        const today = new Date();
        const formattahun = today.getFullYear().toString();
        const formatbulan = (today.getMonth() + 1).toString();

        // Fungsi untuk menghitung total nominal untuk tahun berjalan
        const hitungTotalNominalYearly = (lokasi, tahun, kode) => {
            return lokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && currentValue.kode_distributor === kode && currentValue.kode_produk === currentValue.kode_produk) {
                    accumulator += parseFloat(currentValue.nominal);
                }
                return accumulator;
            }, 0);
        };

        // Fungsi untuk menghitung total nominal untuk bulan berjalan pada tahun berjalan
        const hitungTotalNominalCurrMonth = (lokasi, tahun, bulan, kode) => {
            return lokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && alokasiDate.getMonth() + 1 === bulan && currentValue.kode_distributor === kode) {
                    accumulator += parseFloat(currentValue.nominal);
                }
                return accumulator;
            }, 0);
        };

        // Fungsi untuk menghitung total nominal untuk bulan Januari sampai bulan berjalan pada tahun berjalan
        const hitungTotalNominalMTM = (lokasi, tahun, bulan, kode) => {
            return lokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && parseInt(currentValue.bulan) <= bulan && currentValue.kode_distributor === kode) {
                    accumulator += parseFloat(currentValue.nominal);
                }
                return accumulator;
            }, 0);
        };

        // Membentuk ulang data sesuai dengan format yang diinginkan 
        const rekonstruksiData = lokasi.reduce((accumulator, currentValue) => {

            // Find the corresponding mappingData for the current profile
            const mappingData = mapping_profile.find(item => item.id_distributor === currentValue.kode_distributor);

            if (mappingData) {

                // Inisialisasi objek untuk menyimpan informasi wilayah
                let wilayahInfo = {
                    id_provinsi: "",
                    provinsi: "",
                    id_kabupaten: "",
                    kabupaten: "",
                    id_kecamatan: "",
                    kecamatan: ""
                };

                wilayahInfo = {
                    id_provinsi: mappingData.id_provinsi,
                    provinsi: fact_wilayah.find(item => item.kode === mappingData.id_provinsi)?.nama || "",
                    id_kabupaten: mappingData.id_kabupaten,
                    kabupaten: fact_wilayah.find(item => item.kode === mappingData.id_kabupaten)?.nama || "",
                    id_kecamatan: mappingData.id_kecamatan,
                    kecamatan: fact_wilayah.find(item => item.kode === mappingData.id_kecamatan)?.nama || ""
                };

                // Find the corresponding produkData for the current lokasiItem
                const produkData = produk.find(item => item.kode_produk === currentValue.kode_produk);

                let produkInfo = {
                    nama_produk: "",
                    kode_produk: ""
                };

                if (produkData) {
                    produkInfo = {
                        nama_produk: produkData.nama_produk,
                        kode_produk: produkData.kode_produk
                    };
                }

                // Menggunakan fungsi-fungsi di atas untuk menghitung total nominal
                const yearly = hitungTotalNominalYearly([currentValue], formattahun, currentValue.kode_distributor);
                const curr_month = hitungTotalNominalCurrMonth([currentValue], formattahun, parseInt(formatbulan), currentValue.kode_distributor);
                const mtm = hitungTotalNominalMTM([currentValue], formattahun, parseInt(formatbulan), currentValue.kode_distributor);

                // Generate key for grouping
                const groupKey = `${currentValue.keterangan}_${currentValue.kode_produk}_${currentValue.kode_distributor}_${currentValue.tahun}`;

                // Check if the group already exists, if not, create a new one
                if (!accumulator[groupKey]) {
                    accumulator[groupKey] = {
                        ...wilayahInfo,
                        keterangan: currentValue.keterangan,
                        kode_produk: currentValue.kode_produk,
                        kode_distributor: currentValue.kode_distributor,
                        tahun: currentValue.tahun,
                        yearly: yearly,
                        curr_month: curr_month,
                        mtm: mtm,
                        ...produkInfo
                    };
                } else {
                    // If the group already exists, update the aggregate values
                    accumulator[groupKey].yearly += yearly;
                    accumulator[groupKey].curr_month += curr_month;
                    accumulator[groupKey].mtm += mtm;
                }

            }
            return accumulator;

        }, {});
        // Convert the grouped data object into an array of values
        const resultArray = Object.values(rekonstruksiData);

        // res.status(200).send(mapping_profile);
        res.status(200).send(resultArray);

    } catch (error) {
        res.status(500).send(`${error}`);
    }
}
 */

/* const search = async (request) => {
    const skip = (request.page - 1) * parseInt(request.size);

    const filters = [];

    if (request.kode_distributor) {
        filters.push({
            kode_distributor: {
                contains: request.kode_distributor
            }
        });
    }

    if (request.nama_distributor) {
        filters.push({
            nama_distributor: {
                contains: request.nama_distributor
            }
        });
    }

    const distributor = await db.tbl_distributor.findMany({
        where: {
            OR: filters
        },
        take: parseInt(request.size),
        skip: skip
    });

    const totalItems = await db.tbl_distributor.count({
        where: {
            OR: filters
        }
    });

    return {
        data: distributor,
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / parseInt(request.size))
        }
    }
} */
export default {
    create,
    createbulk,
    get,
    getkios,
    getall,
    update,
    remove,
    // search
    // getalldistributor,
    // getalldistributorsum,
    // getsumwilayah, 
}
