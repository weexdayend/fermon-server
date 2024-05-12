import { db } from "../application/database.js";
const today = new Date();
const formattedDate = today.toISOString();

const formatbulan = (today.getMonth() + 1).toString();
const formattahun = today.getFullYear().toString();

const create = async (request, res) => {

    const {
        tahun,
        bulan,
        besaran,
        kode_distributor,
        keterangan,
        kode_produk,
        kode_provinsi,
        kode_kab_kota,
        kode_kecamatan
    } = request;

    try {
        let newAlokasi;

        await db.$transaction(async (db) => {
            newAlokasi = await db.tbl_alokasi_penjualan.create({
                data: {
                    created_at: formattedDate,
                    tahun: tahun,
                    bulan: bulan,
                    besaran: besaran,
                    kode_distributor: kode_distributor,
                    keterangan: keterangan,
                    kode_produk: kode_produk,
                    kode_provinsi: kode_provinsi,
                    kode_kab_kota: kode_kab_kota,
                    kode_kecamatan: kode_kecamatan,
                    status_alokasi_penjualan: true
                },
            });
        });

        res.status(200).send(newAlokasi);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

const createbulk = async (request, res) => {
    const alokasiPenjualan = request;

    try {
        let newAlokasiArray = [];

        for (let i = 0; i < alokasiPenjualan.length; i++) {
            const alokasi = alokasiPenjualan[i];

            await db.$transaction(async (db) => {
                const newAlokasi = await db.tbl_alokasi_penjualan.create({
                    data: {
                        created_at: formattedDate,
                        tahun: alokasi.tahun,
                        bulan: alokasi.bulan,
                        besaran: alokasi.besaran,
                        kode_distributor: alokasi.kode_distributor,
                        keterangan: alokasi.keterangan,
                        kode_produk: alokasi.kode_produk,
                        kode_provinsi: alokasi.kode_provinsi,
                        kode_kab_kota: alokasi.kode_kab_kota,
                        kode_kecamatan: alokasi.kode_kecamatan,
                        status_alokasi_penjualan: true
                    },
                });
                newAlokasiArray.push(newAlokasi);
            });
        }

        res.status(200).send(newAlokasiArray);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

const update = async (request, res) => {

    const {
        id,
        tahun,
        bulan,
        besaran,
        kode_distributor,
        keterangan,
        kode_produk,
        kode_provinsi,
        kode_kab_kota,
        kode_kecamatan,
        status_alokasi_penjualan
    } = request;

    try {

        let updateAlokasi;
        await db.$transaction(async (db) => {
            const existingalokasi = await db.tbl_alokasi_penjualan.findUnique({
                where: {
                    id: id
                }
            });

            if (!existingalokasi) {
                throw new Error('alokasi penjualan not found');
            }

            updateAlokasi = await db.tbl_alokasi_penjualan.update({
                where: {
                    id: id
                },
                data: {
                    updated_at: formattedDate,
                    tahun: tahun,
                    bulan: bulan,
                    besaran: besaran,
                    kode_distributor: kode_distributor,
                    keterangan: keterangan,
                    kode_produk: kode_produk,
                    kode_provinsi: kode_provinsi,
                    kode_kab_kota: kode_kab_kota,
                    kode_kecamatan: kode_kecamatan,
                    status_alokasi_penjualan: status_alokasi_penjualan,
                }
            });
        });

        res.status(200).send(updateAlokasi);
    } catch (error) {
        res.status(500).send(`${error}`);
    }


}

const remove = async (request, res) => {
    let removeAlokasi;

    await db.$transaction(async (db) => {
        // Mencari entri alokasi penjualan yang akan dihapus
        const existingproduk = await db.tbl_alokasi_penjualan.findUnique({
            where: {
                id: request.id
            }
        });

        // Melemparkan pengecualian jika entri tidak ditemukan
        if (!existingproduk) {
            throw new Error(`Alokasi penjualan not found`);
        }

        // Menghapus entri alokasi penjualan dengan menandai sebagai tidak aktif
        removeAlokasi = await db.tbl_alokasi_penjualan.update({
            where: {
                id: request.id
            },
            data: {
                deleted_at: formattedDate,
                status_alokasi_penjualan: false,
            }
        });
    });

    res.status(200).send(removeAlokasi);
}

const get = async (request, res) => {
    let rekonstruksiData;

    await db.$transaction(async (db) => {

        const distributor = await db.tbl_distributor.findMany({
            select: {
                id: true,
                kode_distributor: true,
                nama_distributor: true,
                status_distributor: true
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

        const alokasi = await db.tbl_alokasi_penjualan.findFirst({
            where: {
                id: request.id
            },
            select: {
                id: true,
                tahun: true,
                bulan: true,
                besaran: true,
                id_distributor: true,
                keterangan: true,
                id_produk: true,
                status_alokasi_penjualan: true,
            }
        });

        if (!alokasi) {
            throw new Error(`Alokasi penjualan not found`);
        }

        rekonstruksiData = {
            id: alokasi.id,
            tahun: alokasi.tahun,
            bulan: alokasi.bulan,
            besaran: alokasi.besaran,
            keterangan: alokasi.keterangan,
            id_distributor: alokasi.id_distributor,
            nama_distributor: distributor.find(d => d.id === alokasi.id_distributor)?.nama_distributor || null,
            id_produk: alokasi.id_produk,
            nama_produk: produk.find(p => p.id_produk === alokasi.id_produk)?.nama_produk || null
        };
    });

    res.status(200).send(rekonstruksiData);
}

const getall = async (res) => {
    let allRekonstruksiData = [];

    await db.$transaction(async (db) => {
        const [distributor, produk, alokasis] = await Promise.all([
            db.tbl_distributor.findMany({
                select: {
                    id: true,
                    kode_distributor: true,
                    nama_distributor: true
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
            db.tbl_alokasi_penjualan.findMany({
                select: {
                    id: true,
                    tahun: true,
                    bulan: true,
                    besaran: true,
                    id_distributor: true,
                    keterangan: true,
                    kode_produk: true,
                    status_alokasi_penjualan: true,
                }
            })
        ]);

        allRekonstruksiData = alokasis.map(alokasi => {
            const namaDistributor = distributor.find(d => d.id === alokasi.id_distributor)?.nama_distributor || null;
            const namaProduk = produk.find(p => p.id === alokasi.id_produk)?.nama_produk || null;

            return {
                id: alokasi.id,
                tahun: alokasi.tahun,
                bulan: alokasi.bulan,
                besaran: alokasi.besaran,
                keterangan: alokasi.keterangan,
                id_distributor: alokasi.id_distributor,
                nama_distributor: namaDistributor,
                kode_produk: alokasi.kode_produk,
                nama_produk: namaProduk,
            };
        });
    });

    res.status(200).send(allRekonstruksiData);
}

const getalldistributor = async (request, res) => {

    try {
        let fact_profile;
        let lokasi;

        await db.$transaction(async (db) => {
            fact_profile = await db.fact_distributor.findMany({
                where: {
                    kode_distributor: "1000000015"
                }
            });
            lokasi = await db.tbl_alokasi_penjualan.findMany();
        });

        // Membentuk ulang data sesuai dengan format yang diinginkan
        const rekonstruksiData = fact_profile.map(profile => {
            // Mencari lokasi berdasarkan id faktor profil
            const lokasiProfile = lokasi.find(item => item.kode_distributor === profile.kode_distributor);

            // Base template untuk bulan 1 sampai 12
            const baseTemplate = Array.from({ length: 12 }, (_, i) => {
                const bulan = i + 1;
                const existingData = lokasi.find(item => item.bulan === bulan.toString() && item.kode_distributor === profile.kode_distributor);

                // Jika data untuk bulan ini sudah ada, gunakan nilainya, jika tidak, gunakan null
                return {
                    besaran: existingData ? existingData.besaran : null,
                    bulan: bulan,
                    tahun: existingData ? existingData.tahun : null,
                    keterangan: existingData ? existingData.keterangan : null,
                    kode_distributor: profile.kode_distributor,
                    kategori: profile.kategori,
                    nama: profile.nama_distributor,
                    alamat: profile.alamat,
                    status: profile.status,
                };
            });

            return baseTemplate;
        });

        // Menggabungkan hasil dari base template menjadi satu array
        const mergedData = rekonstruksiData.flat();


        res.status(200).send(mergedData);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

/* const getalldistributors = async (request, res) => {
    try {
        let fact_profile;
        let lokasi;
        let produk;

        await db.$transaction(async (db) => {
            fact_profile = await db.fact_distributor.findMany({ where:{kode_distributor:"1000000015"}});
            lokasi = await db.tbl_alokasi_penjualan.findMany();
            produk = await db.fact_pupuk.findMany();
        });

        // Membentuk ulang data sesuai dengan format yang diinginkan
        const rekonstruksiData = fact_profile.map(profile => {

            const rekonaray = lokasi.map(itemlokasi => {
 
                const baseTemplate = Array.from({ length: 12 }, (_, i) => {
                    const bulan = i + 1;
                    const produkData = produk.find(itemproduk => itemproduk.kode_produk === itemlokasi.kode_produk);
                    if (profile.kode_distributor ===  itemlokasi.kode_distributor && itemlokasi.bulan === bulan.toString()) {
                        
                        return {
                            besaran: itemlokasi.besaran,
                            bulan: bulan,
                            tahun: itemlokasi.tahun,
                            keterangan: itemlokasi.keterangan,
                            kode_distributor: profile.kode_distributor,
                            kategori: profile.kategori,
                            nama: profile.nama_distributor,
                            produk: produkData ? produkData.nama_produk : null,
                            alamat: profile.alamat,
                            status: profile.status,
                        };
                    } else {
                        return {
                            besaran: null,
                            bulan: bulan,
                            tahun: null,
                            keterangan: null,
                            kode_distributor: profile.kode_distributor,
                            kategori: profile.kategori,
                            nama: profile.nama_distributor,
                            produk: produkData ? produkData.nama_produk : null,
                            alamat: profile.alamat,
                            status: profile.status,
                        };
                    }
                });
                return baseTemplate;
            });
            return rekonaray;
        });

        // Menggabungkan hasil dari base template menjadi satu array
        const mergedData = rekonstruksiData.flat(2); // Menggunakan flat dengan depth 2 untuk menggabungkan array nested

        res.status(200).send(mergedData);
    } catch (error) {
        console.error(error); // Lakukan logging pesan kesalahan
        res.status(500).send("Terjadi kesalahan dalam memproses permintaan.");
    }
} */
/* const getalldistributors = async (request, res) => {
    try {
        let fact_profile;
        let lokasi;
        let produk;

        await db.$transaction(async (db) => {
            fact_profile = await db.fact_distributor.findMany();
            lokasi = await db.tbl_alokasi_penjualan.findMany();
            produk = await db.fact_pupuk.findMany();
        });

        // Membentuk ulang data sesuai dengan format yang diinginkan
        const rekonstruksiData = fact_profile.map(profile => {
            const rekonaray = lokasi.reduce((accumulator, itemlokasi) => {
                const bulan = parseInt(itemlokasi.bulan);
                if (profile.kode_distributor === itemlokasi.kode_distributor) {
                    const produkData = produk.find(itemproduk => itemproduk.kode_produk === itemlokasi.kode_produk);
                    const newData = {
                        besaran: itemlokasi.besaran,
                        bulan: bulan,
                        tahun: itemlokasi.tahun,
                        keterangan: itemlokasi.keterangan,
                        kode_distributor: profile.kode_distributor,
                        kategori: profile.kategori,
                        nama: profile.nama_distributor,
                        produk: produkData ? produkData.nama_produk : null,
                        alamat: profile.alamat,
                        status: profile.status,
                    };
                    const key = `${itemlokasi.tahun}-${bulan}-${profile.kode_distributor}-${itemlokasi.keterangan}-${itemlokasi.kode_produk}`;
                    accumulator[key] = accumulator[key] ? [...accumulator[key], newData] : [newData];
                }
                return accumulator;
            }, {});
            return Object.values(rekonaray).flat();
        });

        // Menggabungkan hasil dari base template menjadi satu array
        const mergedData = rekonstruksiData.flat(); // Menggunakan flat untuk menggabungkan array

        res.status(200).send(mergedData);
    } catch (error) {
        console.error(error); // Lakukan logging pesan kesalahan
        res.status(500).send("Terjadi kesalahan dalam memproses permintaan.");
    }
} */
const getalldistributors = async (request, res) => {

    const {
        tahun,
        bulan,
        // keterangan,
    } = request;

    try {
        let distributor;
        let alokasi;
        let produk;
        let provinsi;
        let kabupaten;
        let kecamatan;

        let filter = { keterangan: "Alokasi" };

        // if (keterangan != "" && keterangan != null) {
        //     filter.keterangan = keterangan;
        // }

        if (tahun != "" && tahun != null) {
            filter.tahun = tahun;
        }
        if (bulan != "" && bulan != null) {
            filter.bulan = bulan;
        }

        await db.$transaction(async (db) => {
            distributor = await db.fact_distributor.findMany();
            alokasi = await db.tbl_alokasi_penjualan.findMany({ where: filter });
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

/* const getalldistributorsum = async (request, res) => {
    const { kode } = request
    try {
        let mapping_profile;
        let fact_wilayah;
        let fact_wilayah_prov;
        let fact_wilayah_kab;
        let fact_wilayah_kec;
        let fact_profile;
        let alokasi;
        let produk;

        let whereprofile = {};

        if (kode !== '' && kode !== null) {
            whereprofile.kode_distributor = kode;
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
            // fact_wilayah = await db.fact_wilayah.findMany();
            fact_wilayah_prov = await db.fact_provinsi.findMany();
            fact_wilayah_kab = await db.fact_kab_kota.findMany();
            fact_wilayah_kec = await db.fact_kecamatan.findMany();
            fact_profile = await db.fact_distributor.findMany({
                where: whereprofile
            });
            alokasi = await db.tbl_alokasi_penjualan.findMany();
            produk = await db.fact_pupuk.findMany();
        });

        // Mengambil tanggal hari ini untuk referensi bulan dan tahun berjalan
        // const today = new Date();
        // const formattahun = today.getFullYear().toString();
        // const formatbulan = (today.getMonth() + 1).toString();

        // Fungsi untuk menghitung total besaran untuk tahun berjalan
        const hitungTotalbesaranYearly = (alokasi, tahun, kode) => {
            return alokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && currentValue.kode_distributor === kode && currentValue.kode_produk === currentValue.kode_produk) {
                    accumulator += parseFloat(currentValue.besaran);
                }
                return accumulator;
            }, 0);
        };

        // Fungsi untuk menghitung total besaran untuk bulan berjalan pada tahun berjalan
        const hitungTotalbesaranCurrMonth = (alokasi, tahun, bulan, kode) => {
            return alokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && alokasiDate.getMonth() + 1 === bulan && currentValue.kode_distributor === kode) {
                    accumulator += parseFloat(currentValue.besaran);
                }
                return accumulator;
            }, 0);
        };

        // Fungsi untuk menghitung total besaran untuk bulan Januari sampai bulan berjalan pada tahun berjalan
        const hitungTotalbesaranMTM = (alokasi, tahun, bulan, kode) => {
            return alokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && parseInt(currentValue.bulan) <= bulan && currentValue.kode_distributor === kode) {
                    accumulator += parseFloat(currentValue.besaran);
                }
                return accumulator;
            }, 0);
        };

        // Membentuk ulang data sesuai dengan format yang diinginkan
        const rekonstruksiData = alokasi.reduce((accumulator, currentValue) => {
            // Find the corresponding profile for the current lokasiItem
            const profile = fact_profile.find(profileItem => profileItem.kode_distributor === currentValue.kode_distributor);

            if (profile) {
                // Find the corresponding mappingData for the current profile
                const mappingData = mapping_profile.find(item => item.kode_distributor === profile.kode_distributor);

                // Inisialisasi objek untuk menyimpan informasi wilayah
                let wilayahInfo = {
                    kode_provinsi: "",
                    provinsi: "",
                    kode_kab_kota: "",
                    kabupaten: "",
                    kode_kecamatan: "",
                    kecamatan: ""
                };

                // Jika data mapping ditemukan, cari informasi wilayah dari fact_wilayah
                if (mappingData) {
                    wilayahInfo = {
                        kode_provinsi: mappingData.kode_provinsi,
                        provinsi: fact_wilayah_prov.find(item => item.kode_provinsi === mappingData.kode_provinsi)?.nama_provinsi || "",
                        kode_kab_kota: mappingData.kode_kab_kota,
                        kabupaten: fact_wilayah_kab.find(item => item.kode_kab_kota === mappingData.kode_kab_kota)?.nama_kabupaten || "",
                        id_kecamatan: mappingData.kode_kecamatan,
                        kecamatan: fact_wilayah_kec.find(item => item.kode_kecamatan === mappingData.kode_kecamatan)?.nama_kecamatan || ""
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

                // Menggunakan fungsi-fungsi di atas untuk menghitung total besaran
                const yearly = hitungTotalbesaranYearly([currentValue], formattahun, profile.kode_distributor);
                const curr_month = hitungTotalbesaranCurrMonth([currentValue], formattahun, parseInt(formatbulan), profile.kode_distributor);
                const mtm = hitungTotalbesaranMTM([currentValue], formattahun, parseInt(formatbulan), profile.kode_distributor);

                // Generate key for grouping
                const groupKey = `${currentValue.keterangan}_${currentValue.kode_produk}_${currentValue.kode_distributor}_${currentValue.tahun}`;

                // Check if the group already exists, if not, create a new one
                if (!accumulator[groupKey]) {
                    accumulator[groupKey] = {
                        id: profile.kode,
                        kategori: profile.kategori,
                        kode: profile.kode_distributor,
                        nama: profile.nama_distributor,
                        alamat: profile.alamat,
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

        res.status(200).send(resultArray);

    } catch (error) {
        res.status(500).send(`${error}`);
    }
} 
const getsumwilayah = async (request, res) => {
    const {
        kode,
        kode_provinsi,
        kode_kab_kota,
        kode_kecamatan
    } = request
    try {

        let mapping_profile;
        let fact_wilayah_prov;
        let fact_wilayah_kab;
        let fact_wilayah_kec;
        let fact_profile;
        let alokasi;
        let produk;

        let whereprofile = {};

        let wheremapping = {
            kategori: "Distributor",
            NOT: {
                kode_distributor: {
                    equals: null,
                    equals: ""
                }
            }
        };

        if (kode !== '' && kode !== null) {
            whereprofile.kode_distributor = kode;
        }

        if (kode !== '' && kode !== null) {
            wheremapping.kode_distributor = kode;
        }
        if (kode_provinsi !== '' && kode_provinsi !== null) {
            wheremapping.kode_provinsi = kode_provinsi;
        }
        if (kode_kab_kota !== '' && kode_kab_kota !== null) {
            wheremapping.kode_kab_kota = kode_kab_kota;
        }
        if (kode_kecamatan !== '' && kode_kecamatan !== null) {
            wheremapping.kode_kecamatan = kode_kecamatan;
        }

        await db.$transaction(async (db) => {

            fact_profile = await db.fact_distributor.findMany({
                where: whereprofile
            });
            mapping_profile = await db.fact_map_area.findMany({
                where: wheremapping
            });
            fact_wilayah_prov = await db.fact_provinsi.findMany();
            fact_wilayah_kab = await db.fact_kab_kota.findMany();
            fact_wilayah_kec = await db.fact_kecamatan.findMany();
            alokasi = await db.tbl_alokasi_penjualan.findMany();
            produk = await db.fact_pupuk.findMany();
        });

        // Mengambil tanggal hari ini untuk referensi bulan dan tahun berjalan
        // const today = new Date();
        // const formattahun = today.getFullYear().toString();
        // const formatbulan = (today.getMonth() + 1).toString();

        // Fungsi untuk menghitung total besaran untuk tahun berjalan
        const hitungTotalbesaranYearly = (lokasi, tahun, kode) => {
            return lokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && currentValue.kode_distributor === kode && currentValue.kode_produk === currentValue.kode_produk) {
                    accumulator += parseFloat(currentValue.besaran);
                }
                return accumulator;
            }, 0);
        };

        // Fungsi untuk menghitung total besaran untuk bulan berjalan pada tahun berjalan
        const hitungTotalbesaranCurrMonth = (lokasi, tahun, bulan, kode) => {
            return lokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && alokasiDate.getMonth() + 1 === bulan && currentValue.kode_distributor === kode) {
                    accumulator += parseFloat(currentValue.besaran);
                }
                return accumulator;
            }, 0);
        };

        // Fungsi untuk menghitung total besaran untuk bulan Januari sampai bulan berjalan pada tahun berjalan
        const hitungTotalbesaranMTM = (lokasi, tahun, bulan, kode) => {
            return lokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && parseInt(currentValue.bulan) <= bulan && currentValue.kode_distributor === kode) {
                    accumulator += parseFloat(currentValue.besaran);
                }
                return accumulator;
            }, 0);
        };

        // Membentuk ulang data sesuai dengan format yang diinginkan 
        const rekonstruksiData = alokasi.reduce((accumulator, currentValue) => {

            // Find the corresponding mappingData for the current profile
            const mappingData = mapping_profile.find(item => item.kode_distributor === currentValue.kode_distributor);

            if (mappingData) {

                // Inisialisasi objek untuk menyimpan informasi wilayah
                let wilayahInfo = {
                    kode_provinsi: "",
                    provinsi: "",
                    kode_kab_kota: "",
                    kabupaten: "",
                    kode_kecamatan: "",
                    kecamatan: ""
                };

                wilayahInfo = {
                    kode_provinsi: mappingData.kode_provinsi,
                    provinsi: fact_wilayah_prov.find(item => item.kode_provinsi === mappingData.kode_provinsi)?.nama_provinsi || "",
                    kode_kab_kota: mappingData.kode_kab_kota,
                    kabupaten: fact_wilayah_kab.find(item => item.kode_kab_kota === mappingData.kode_kab_kota)?.nama_kabupaten || "",
                    id_kecamatan: mappingData.kode_kecamatan,
                    kecamatan: fact_wilayah_kec.find(item => item.kode_kecamatan === mappingData.kode_kecamatan)?.nama_kecamatan || ""
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

                // Menggunakan fungsi-fungsi di atas untuk menghitung total besaran
                const yearly = hitungTotalbesaranYearly([currentValue], formattahun, currentValue.kode_distributor);
                const curr_month = hitungTotalbesaranCurrMonth([currentValue], formattahun, parseInt(formatbulan), currentValue.kode_distributor);
                const mtm = hitungTotalbesaranMTM([currentValue], formattahun, parseInt(formatbulan), currentValue.kode_distributor);

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
} */
const getalldistributorsum = async (request, res) => {
    const { kode } = request
    try {
        let mapping_profile;
        let fact_wilayah;
        let fact_wilayah_prov;
        let fact_wilayah_kab;
        let fact_wilayah_kec;
        let fact_profile;
        let alokasi;
        let produk;

        let whereprofile = {};

        if (kode !== '' && kode !== null) {
            whereprofile.kode_distributor = kode;
        }

        await db.$transaction(async (db) => {
            mapping_profile = await db.fact_map_area.findMany({
                where: {
                    NOT: [
                        { kode_distributor: null },
                        { kode_distributor: "" },
                        { kode_distributor: "-" }
                    ]
                }
            });
            fact_wilayah_prov = await db.fact_provinsi.findMany();
            fact_wilayah_kab = await db.fact_kab_kota.findMany();
            fact_wilayah_kec = await db.fact_kecamatan.findMany();
            fact_profile = await db.fact_distributor.findMany({
                where: whereprofile
            });
            alokasi = await db.tbl_alokasi_penjualan.findMany();
            produk = await db.fact_pupuk.findMany();
        });

        // Mengambil tanggal hari ini untuk referensi bulan dan tahun berjalan
        // const today = new Date();
        // const formattahun = today.getFullYear().toString();
        // const formatbulan = (today.getMonth() + 1).toString();

        // Fungsi untuk menghitung total besaran untuk tahun berjalan
        const hitungTotalbesaranYearly = (alokasi, tahun, kode) => {
            return alokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && currentValue.kode === kode && currentValue.kode_produk === currentValue.kode_produk) {
                    accumulator += parseFloat(currentValue.besaran);
                }
                return accumulator;
            }, 0);
        };

        // Fungsi untuk menghitung total besaran untuk bulan berjalan pada tahun berjalan
        const hitungTotalbesaranCurrMonth = (alokasi, tahun, bulan, kode) => {
            return alokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && alokasiDate.getMonth() + 1 === bulan && currentValue.kode === kode) {
                    accumulator += parseFloat(currentValue.besaran);
                }
                return accumulator;
            }, 0);
        };

        // Fungsi untuk menghitung total besaran untuk bulan Januari sampai bulan berjalan pada tahun berjalan
        const hitungTotalbesaranMTM = (alokasi, tahun, bulan, kode) => {
            return alokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && parseInt(currentValue.bulan) <= bulan && currentValue.kode === kode) {
                    accumulator += parseFloat(currentValue.besaran);
                }
                return accumulator;
            }, 0);
        };

        // Membentuk ulang data sesuai dengan format yang diinginkan
        const rekonstruksiData = alokasi.reduce((accumulator, currentValue) => {

            const profile = fact_profile.find(profileItem => profileItem.kode_distributor === currentValue.kode);

            if (profile) {

                const mappingData = mapping_profile.find(item => item.kode_distributor === profile.kode_distributor);

                let wilayahInfo = {
                    kode_provinsi: "",
                    provinsi: "",
                    kode_kab_kota: "",
                    kabupaten: "",
                    kode_kecamatan: "",
                    kecamatan: ""
                };

                // Jika data mapping ditemukan, cari informasi wilayah dari fact_wilayah
                if (mappingData) {
                    wilayahInfo = {
                        kode_provinsi: mappingData.kode_provinsi,
                        provinsi: fact_wilayah_prov.find(item => item.kode_provinsi === mappingData.kode_provinsi)?.nama_provinsi || "",
                        kode_kab_kota: mappingData.kode_kab_kota,
                        kabupaten: fact_wilayah_kab.find(item => item.kode_kab_kota === mappingData.kode_kab_kota)?.nama_kabupaten || "",
                        id_kecamatan: mappingData.kode_kecamatan,
                        kecamatan: fact_wilayah_kec.find(item => item.kode_kecamatan === mappingData.kode_kecamatan)?.nama_kecamatan || ""
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

                // Menggunakan fungsi-fungsi di atas untuk menghitung total besaran
                const yearly = hitungTotalbesaranYearly([currentValue], formattahun, profile.kode_distributor);
                const curr_month = hitungTotalbesaranCurrMonth([currentValue], formattahun, parseInt(formatbulan), profile.kode_distributor);
                const mtm = hitungTotalbesaranMTM([currentValue], formattahun, parseInt(formatbulan), profile.kode_distributor);

                // Generate key for grouping
                const groupKey = `${currentValue.keterangan}_${currentValue.kode_produk}_${currentValue.kode}_${currentValue.tahun}`;

                // Check if the group already exists, if not, create a new one
                if (!accumulator[groupKey]) {
                    accumulator[groupKey] = {
                        id: profile.kode,
                        kategori: profile.kategori,
                        kode: profile.kode_distributor,
                        nama: profile.nama_distributor,
                        alamat: profile.alamat,
                        ...wilayahInfo,
                        keterangan: currentValue.keterangan,
                        kode_produk: currentValue.kode_produk,
                        kode_distributor: currentValue.kode,
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
}
/* const getsumwilayah = async (request, res) => {
    const {
        kode,
    } = request
    try {

        let mapping_profile;
        let fact_wilayah_prov;
        let fact_wilayah_kab;
        let fact_wilayah_kec;
        let fact_profile;
        let alokasi;
        let produk;

        // let whereprofile = {};

        let wheremapping = {
            keterangan: "Alokasi"
        };

        // if (kode !== '' && kode !== null) {
        //     whereprofile.kode_distributor = kode;
        // }

        if (kode !== '' && kode !== null) {
            wheremapping.kode = kode;
        }
        
        await db.$transaction(async (db) => {

            fact_profile = await db.fact_distributor.findMany();
            mapping_profile = await db.fact_map_area.findMany();
            fact_wilayah_prov = await db.fact_provinsi.findMany();
            fact_wilayah_kab = await db.fact_kab_kota.findMany();
            fact_wilayah_kec = await db.fact_kecamatan.findMany();
            alokasi = await db.tbl_alokasi_penjualan.findMany({ where: wheremapping });
            produk = await db.fact_pupuk.findMany();
        });

        // Mengambil tanggal hari ini untuk referensi bulan dan tahun berjalan
        // const today = new Date();
        // const formattahun = today.getFullYear().toString();
        // const formatbulan = (today.getMonth() + 1).toString();

        // Fungsi untuk menghitung total besaran untuk tahun berjalan
        const hitungTotalbesaranYearly = (lokasi, tahun, kode) => {
            return lokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && currentValue.kode === kode && currentValue.kode_produk === currentValue.kode_produk) {
                    accumulator += parseFloat(currentValue.besaran);
                }
                return accumulator;
            }, 0);
        };

        // Fungsi untuk menghitung total besaran untuk bulan berjalan pada tahun berjalan
        const hitungTotalbesaranCurrMonth = (lokasi, tahun, bulan, kode) => {
            return lokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && alokasiDate.getMonth() + 1 === bulan && currentValue.kode === kode) {
                    accumulator += parseFloat(currentValue.besaran);
                }
                return accumulator;
            }, 0);
        };

        // Fungsi untuk menghitung total besaran untuk bulan Januari sampai bulan berjalan pada tahun berjalan
        const hitungTotalbesaranMTM = (lokasi, tahun, bulan, kode) => {
            return lokasi.reduce((accumulator, currentValue) => {
                const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                if (alokasiDate.getFullYear().toString() === tahun && parseInt(currentValue.bulan) <= bulan && currentValue.kode === kode) {
                    accumulator += parseFloat(currentValue.besaran);
                }
                return accumulator;
            }, 0);
        };

        // Membentuk ulang data sesuai dengan format yang diinginkan 
        const rekonstruksiData = alokasi.reduce((accumulator, currentValue) => {

            // Find the corresponding mappingData for the current profile
            // const mappingData = mapping_profile.find(item => item.kode_distributor === currentValue.kode_distributor);

            let nama_kategori = "";
            if (currentValue.kategori == "Provinsi") {
                nama_kategori = fact_provinsi.find(pv => pv.kode_provinsi === currentValue.kode)?.nama_provinsi || null;
            }
            if (currentValue.kategori == "Kabupaten") {
                nama_kategori = fact_kab_kota.find(kb => kb.kode_kab_kota === currentValue.kode)?.nama_kab_kota || null;
            }
            if (currentValue.kategori == "Kota") {
                nama_kategori = fact_kab_kota.find(kb => kb.kode_kab_kota === currentValue.kode)?.nama_kab_kota || null;
            }
            if (currentValue.kategori == "Kecamatan") {
                nama_kategori = fact_kecamatan.find(kc => kc.kode_kecamatan === currentValue.kode)?.nama_kecamatan || null;
            }
            if (currentValue.kategori == "Distributor") {
                nama_kategori = fact_profile.find(ds => ds.kode_distributor === currentValue.kode)?.nama_distributor || null;
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

            // Menggunakan fungsi-fungsi di atas untuk menghitung total besaran
            const yearly = hitungTotalbesaranYearly([currentValue], formattahun, currentValue.kode);
            const curr_month = hitungTotalbesaranCurrMonth([currentValue], formattahun, parseInt(formatbulan), currentValue.kode);
            const mtm = hitungTotalbesaranMTM([currentValue], formattahun, parseInt(formatbulan), currentValue.kode);

            // Generate key for grouping
            const groupKey = `${currentValue.keterangan}_${currentValue.kode_produk}_${currentValue.kode}_${currentValue.tahun}`;

            // Check if the group already exists, if not, create a new one
            if (!accumulator[groupKey]) {
                accumulator[groupKey] = {
                    kode: currentValue.kode,
                    kategori: currentValue.kategori,
                    nama_kategori: nama_kategori,
                    keterangan: currentValue.keterangan,
                    kode_produk: currentValue.kode_produk,
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

            return accumulator;

        }, {});
        // Convert the grouped data object into an array of values
        const resultArray = Object.values(rekonstruksiData);

        // res.status(200).send(mapping_profile);
        res.status(200).send(resultArray);

    } catch (error) {
        res.status(500).send(`${error}`);
    }
} */
const getsumwilayah = async (request, res) => {
    const { kode, tahun } = request;
    try {
        let wheremapping = {
            keterangan: "Alokasi"
        };


        if (kode !== '' && kode !== null) {
            wheremapping.kode = kode;
        }
        if (tahun !== '' && tahun !== null) {
            wheremapping.tahun = tahun;
        }

        const [fact_profile, mapping_profile, fact_wilayah_prov, fact_wilayah_kab, fact_wilayah_kec, alokasi, produk] = await Promise.all([
            db.fact_distributor.findMany(),
            db.fact_map_area.findMany(),
            db.fact_provinsi.findMany(),
            db.fact_kab_kota.findMany(),
            db.fact_kecamatan.findMany(),
            db.tbl_alokasi_penjualan.findMany({ where: wheremapping }),
            db.fact_pupuk.findMany()
        ]);

        const formattahun = new Date().getFullYear().toString();
        const formatbulan = (new Date().getMonth() + 1).toString();

        const rekonstruksiData = alokasi.reduce((accumulator, currentValue) => {
            const nama_kategori = {
                "Provinsi": fact_wilayah_prov.find(pv => pv.kode_provinsi === currentValue.kode)?.nama_provinsi || null,
                "Kabupaten": fact_wilayah_kab.find(kb => kb.kode_kab_kota === currentValue.kode)?.nama_kab_kota || null,
                "Kota": fact_wilayah_kab.find(kb => kb.kode_kab_kota === currentValue.kode)?.nama_kab_kota || null,
                "Kecamatan": fact_wilayah_kec.find(kc => kc.kode_kecamatan === currentValue.kode)?.nama_kecamatan || null,
                "Distributor": fact_profile.find(ds => ds.kode_distributor === currentValue.kode)?.nama_distributor || null
            }[currentValue.kategori];

            const produkData = produk.find(item => item.kode_produk === currentValue.kode_produk);

            // Fungsi untuk menghitung total besaran untuk tahun berjalan
            const hitungTotalbesaranYearly = (lokasi, tahun, kode) => {
                return lokasi.reduce((accumulator, currentValue) => {
                    const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                    if (alokasiDate.getFullYear().toString() === tahun && currentValue.kode === kode && currentValue.kode_produk === currentValue.kode_produk) {
                        accumulator += parseFloat(currentValue.besaran);
                    }
                    return accumulator;
                }, 0);
            };

            // Fungsi untuk menghitung total besaran untuk bulan berjalan pada tahun berjalan
            const hitungTotalbesaranCurrMonth = (lokasi, tahun, bulan, kode) => {
                return lokasi.reduce((accumulator, currentValue) => {
                    const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                    if (alokasiDate.getFullYear().toString() === tahun && alokasiDate.getMonth() + 1 === bulan && currentValue.kode === kode) {
                        accumulator += parseFloat(currentValue.besaran);
                    }
                    return accumulator;
                }, 0);
            };

            // Fungsi untuk menghitung total besaran untuk bulan Januari sampai bulan berjalan pada tahun berjalan
            const hitungTotalbesaranMTM = (lokasi, tahun, bulan, kode) => {
                return lokasi.reduce((accumulator, currentValue) => {
                    const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                    if (alokasiDate.getFullYear().toString() === tahun && parseInt(currentValue.bulan) <= bulan && currentValue.kode === kode) {
                        accumulator += parseFloat(currentValue.besaran);
                    }
                    return accumulator;
                }, 0);
            };

            const groupKey = `${currentValue.keterangan}_${currentValue.kode_produk}_${currentValue.kode}_${currentValue.tahun}`;
            const yearly = hitungTotalbesaranYearly([currentValue], tahun.toString(), currentValue.kode);
            const curr_month = hitungTotalbesaranCurrMonth([currentValue], tahun.toString(), parseInt(formatbulan), currentValue.kode);
            const mtm = hitungTotalbesaranMTM([currentValue], tahun.toString(), parseInt(formatbulan), currentValue.kode);
            if (!accumulator[groupKey]) {
                accumulator[groupKey] = {
                    kode: currentValue.kode,
                    kategori: currentValue.kategori,
                    nama_kategori,
                    keterangan: currentValue.keterangan,
                    tahun: currentValue.tahun,
                    yearly: yearly,
                    curr_month: curr_month,
                    mtm: mtm,
                    // kode_produk: currentValue.kode_produk,
                    nama_produk: produkData?.nama_produk || "",
                    kode_produk: produkData?.kode_produk || ""
                };
            } else {
                accumulator[groupKey].yearly += yearly;
                accumulator[groupKey].curr_month += curr_month;
                accumulator[groupKey].mtm += mtm;
            }

            return accumulator;

        }, {});

        const resultArray = Object.values(rekonstruksiData);
        res.status(200).send(resultArray);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Terjadi kesalahan dalam pemrosesan data.");
    }
};

const getsumwtebusjual = async (request, res) => {
    const { kode, tahun } = request;
    const today = new Date();
    const bulanjalan = (today.getMonth() + 1).toString();
    try {
        let wheremapping = {
            keterangan: {
                in: ["Tebus", "Jual"]
            },
            bulan: bulanjalan
        };


        if (kode !== '' && kode !== null) {
            wheremapping.kode = kode;
        }
        if (tahun !== '' && tahun !== null) {
            wheremapping.tahun = tahun;
        }

        const [fact_profile, mapping_profile, fact_wilayah_prov, fact_wilayah_kab, fact_wilayah_kec, alokasi, produk] = await Promise.all([
            db.fact_distributor.findMany(),
            db.fact_map_area.findMany(),
            db.fact_provinsi.findMany(),
            db.fact_kab_kota.findMany(),
            db.fact_kecamatan.findMany(),
            db.tbl_alokasi_penjualan.findMany({ where: wheremapping }),
            db.fact_pupuk.findMany()
        ]);

        const formattahun = new Date().getFullYear().toString();
        const formatbulan = (new Date().getMonth() + 1).toString();

        const rekonstruksiData = alokasi.reduce((accumulator, currentValue) => {
            const nama_kategori = {
                "Provinsi": fact_wilayah_prov.find(pv => pv.kode_provinsi === currentValue.kode)?.nama_provinsi || null,
                "Kabupaten": fact_wilayah_kab.find(kb => kb.kode_kab_kota === currentValue.kode)?.nama_kab_kota || null,
                "Kota": fact_wilayah_kab.find(kb => kb.kode_kab_kota === currentValue.kode)?.nama_kab_kota || null,
                "Kecamatan": fact_wilayah_kec.find(kc => kc.kode_kecamatan === currentValue.kode)?.nama_kecamatan || null,
                "Distributor": fact_profile.find(ds => ds.kode_distributor === currentValue.kode)?.nama_distributor || null
            }[currentValue.kategori];

            const produkData = produk.find(item => item.kode_produk === currentValue.kode_produk);

            // Fungsi untuk menghitung total besaran untuk tahun berjalan
            const hitungbesaran = (lokasi, tahun, kode) => {
                return lokasi.reduce((accumulator, currentValue) => {
                    const alokasiDate = new Date(currentValue.tahun, parseInt(currentValue.bulan) - 1);
                    if (alokasiDate.getFullYear().toString() === tahun && currentValue.kode === kode && currentValue.kode_produk === currentValue.kode_produk) {
                        accumulator += parseFloat(currentValue.besaran);
                    }
                    return accumulator;
                }, 0);
            };

            // const groupKey = `${currentValue.keterangan}_${currentValue.kode}_${currentValue.tahun}`;
            const groupKey = `${currentValue.keterangan}_${currentValue.kode_produk}_${currentValue.kode}_${currentValue.tahun}`;
            const yearly = hitungbesaran([currentValue], tahun.toString(), currentValue.kode);
            if (!accumulator[groupKey]) {
                accumulator[groupKey] = {
                    kode: currentValue.kode,
                    nama_kategori: nama_kategori,
                    keterangan: currentValue.keterangan,
                    tahun: currentValue.tahun,
                    bulan: currentValue.bulan,
                    besaran: yearly,
                    nama_produk: produkData?.nama_produk || "",
                    kode_produk: produkData?.kode_produk || ""
                };
            } else {
                accumulator[groupKey].besaran += yearly;
            }

            return accumulator;

        }, {});

        const resultArray = Object.values(rekonstruksiData);
        res.status(200).send(resultArray);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Terjadi kesalahan dalam pemrosesan data.");
    }
};

export default {
    create,
    createbulk,
    getalldistributor,
    getalldistributors,
    getalldistributorsum,
    getsumwilayah,
    getsumwtebusjual,
    get,
    getall,
    update,
    remove,
}
