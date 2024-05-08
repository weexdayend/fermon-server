import { db } from "../application/database.js";
const today = new Date();
const formattedDate = today.toISOString();

const create = async (request, res) => {
    const {
        kode_petugas,
        foto,
        nama_petugas,
        contact,
        contact_wa,
        jabatan,
        wilker,
        status_kepagawaian
    } = request;
    try {
        let newPetugas;

        await db.$transaction(async (db) => {
            newPetugas = await db.fact_petugas.create({
                data: {
                    created_at: formattedDate,
                    kode_petugas: kode_petugas,
                    foto: foto,
                    nama_petugas: nama_petugas,
                    contact: contact,
                    contact_wa: contact_wa,
                    jabatan: jabatan,
                    wilker: wilker,
                    status_kepagawaian: status_kepagawaian,
                    status_petugas: true,
                }
            });
        });

        res.status(200).send(newPetugas);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

const createbulk = async (request, res) => {
    const arrPetugas = request; // Fix typo

    try {
        let newPetugasArray = [];

        await db.$transaction(async (db) => {
            for (let i = 0; i < arrPetugas.length; i++) {
                const petugasData = arrPetugas[i];

                const newPetugas = await db.fact_petugas.create({
                    data: {
                        created_at: formattedDate,
                        kode_petugas: petugasData.kode_petugas,
                        nama_petugas: petugasData.nama_petugas,
                        contact: petugasData.contact,
                        contact_wa: petugasData.contact_wa,
                        jabatan: petugasData.jabatan,
                        wilker: petugasData.wilker,
                        status_kepagawaian: petugasData.status_kepagawaian,
                        status_petugas: true,
                    },
                });
                newPetugasArray.push(newPetugas);
            }
        });

        res.status(200).send(newPetugasArray);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
}

/* const update = async (request, res) => {

    const {
        id,
        kode_petugas,
        foto,
        nama_petugas,
        contact,
        contact_wa,
        jabatan,
        wilker,
        status_kepagawaian,
        status_petugas
    } = request;

    try {
        let updatedPetugas;

        await db.$transaction(async (db) => {
            // Cari data petugas berdasarkan ID
            const existingPetugas = await db.fact_petugas.findUnique({
                where: {
                    id: id
                }
            });

            // Jika petugas tidak ditemukan, lempar error
            if (!existingPetugas) {
                throw new Error('Petugas not found');
            }

            // Lakukan update data petugas
            updatedPetugas = await db.tbl_petugas.update({
                where: {
                    id: id
                },
                data: {
                    updated_at: formattedDate,
                    kode_petugas: kode_petugas,
                    foto: foto,
                    nama_petugas: nama_petugas,
                    contact: contact,
                    contact_wa: contact_wa,
                    jabatan: jabatan,
                    wilker: wilker,
                    status_kepagawaian: status_kepagawaian,
                    status_petugas: status_petugas,
                }
            });
        });

        res.status(200).send(updatedPetugas);
    } catch (error) {
        res.status(500).send(`${error}`);
    }


}
 */
const update = async (request, res) => {

    const {
        id,
        kode_petugas,
        foto,
        nama_petugas,
        contact,
        contact_wa,
        jabatan,
        wilker,
        status_kepagawaian,
        status_petugas
    } = request;

    try {
        let updatedPetugas;

        await db.$transaction(async (db) => {
            // Cari data petugas berdasarkan ID
            const existingPetugas = await db.fact_petugas.findUnique({
                where: {
                    id: id
                }
            });

            // Jika petugas tidak ditemukan, lempar error
            if (!existingPetugas) {
                throw new Error('Petugas not found');
            }

            // Lakukan update data petugas
            const updateData = {
                updated_at: formattedDate,
                kode_petugas: kode_petugas,
                nama_petugas: nama_petugas,
                contact: contact,
                contact_wa: contact_wa,
                jabatan: jabatan,
                wilker: wilker,
                status_kepagawaian: status_kepagawaian,
                status_petugas: status_petugas,
            };

            // Tambahkan foto ke data update jika ada foto yang diberikan
            if (foto) {
                updateData.foto = foto;
            }

            updatedPetugas = await db.tbl_petugas.update({
                where: {
                    id: id
                },
                data: updateData
            });
        });

        res.status(200).send(updatedPetugas);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}


const remove = async (request, res) => {

    try {
        let updatedPetugas;

        await db.$transaction(async (db) => {
            const existingPetugas = await db.tbl_petugas.findUnique({
                where: {
                    id: request.id
                }
            });

            if (!existingPetugas) {
                throw new Error('Petugas not found');
            }

            updatedPetugas = await db.tbl_petugas.update({
                where: {
                    id: request.id
                },
                data: {
                    deleted_at: formattedDate,
                    status_petugas: false,
                }
            });
        });

        res.status(200).send(updatedPetugas);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

const get = async (request, res) => {

    const {
        kode
    } = request;
    try {

        let filter = {};
        // if (kode !== '' && kode !== null) {
        //     filter.kode_petugas = kode;
        // } 
        const petugas = await db.fact_petugas.findMany({
            where: filter
        });

        if (!petugas) {
            res.status(200).send("Petugas not found");
        }

        if (kode !== '' && kode !== null) {
            let searchdata = petugas.filter(p => {
                return p.wilker.some(w => w.kode === kode);
            });
            res.status(200).send(searchdata);
        } else {
            res.status(200).send(petugas);
        }

    } catch (error) {
        res.status(500).send(`${error}`);
    }
}
const getmonitoring = async (request, res) => {

    const {
        kode
    } = request;
    try {

        let filter = {};

        const petugas = await db.fact_petugas.findMany({
            where: filter,
            select: {
                kode_petugas: true,
                nama_petugas: true,
                contact: true,
                contact_wa: true,
                jabatan: true,
                departemen: true,
                status_kepagawaian: true,
                wilker: true,
                foto: true,
            }
        });

        if (!petugas) {
            res.status(200).send("Petugas not found");
        }

        if (kode !== '' && kode !== null) {
            let searchdata = petugas.filter(p => {
                return p.wilker.some(w => w.kode === kode);
            });
            res.status(200).send(searchdata);
        } else {
            res.status(200).send(petugas);
        }

    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

/* const getall = async (request, res) => {
    try {
        const petugas = await db.tbl_petugas.findMany({
            select: {
                id: true,
                kode_petugas: true,
                nama_petugas: true,
                contact: true,
                contact_wa: true,
                jabatan: true,
                status_petugas: true,
            }
        });
        // Check apakah ada data petugas
        if (petugas.length === 0) {
            throw new Error('Petugas not found');
        }

        const profile = await db.profile.findMany({
            select: {
                id: true,
                kode: true,
                kategori: true,
                nama: true,
                longitude: true,
                lattitude: true,
                alamat: true,
                status_profile: true,
            }
        });

        const wilayah = await db.wilayah.findMany({
            select: {
                id: true,
                kode: true,
                nama: true,
                kategori: true,
                status_wilayah: true,
            }
        });

        const mappingpetugas = await db.mapping_petugas.findMany({
            select: {
                id: true,
                id_petugas: true,
                id_provinsi: true,
                id_kabupaten: true,
                id_kecamatan: true,
                id_gudang: true,
                id_distributor: true,
                id_kios: true,
                kategori: true,
                status_mapping: true,
            }
        });

        // Memproses data ulang
        const reconstructedData = petugas.map(petugasItem => {
            // Memfilter data mapping petugas yang sesuai dengan id petugas saat ini
            const mappedData = mappingpetugas.filter(item => item.id_petugas === petugasItem.id && (item.id_gudang || item.id_distributor || item.id_kios)); // Filter untuk menghapus yang id_gudang, id_distributor, dan id_kios-nya null
            // Mengonversi id wilayah menjadi nama wilayah
            const wilayahData = mappedData.map(item => {
                if (item.id_gudang) {
                    const wilayahInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_provinsi);
                    const kabupatenInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_kabupaten);
                    const kecamatanInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_kecamatan);

                    return {
                        id: item.id,
                        id_provinsi: item.id_provinsi,
                        provinsi: wilayahInfo ? wilayahInfo.nama : null,
                        id_kabupaten: item.id_kabupaten,
                        kabupaten: kabupatenInfo ? kabupatenInfo.nama : null,
                        id_kecamatan: item.id_kecamatan,
                        kecamatan: kecamatanInfo ? kecamatanInfo.nama : null,
                        id_gudang: item.id_gudang,
                        gudang: profile.find(profileItem => profileItem.kode === item.id_gudang)?.nama || null,
                        status: item.status_mapping
                    };
                } else {
                    return null;
                }
            }).filter(wilayahData => wilayahData !== null);

            // Mengonversi id distributor menjadi nama distributor
            const distributorData = mappedData.map(item => {
                if (item.id_distributor) {
                    const wilayahInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_provinsi);
                    const kabupatenInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_kabupaten);
                    const kecamatanInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_kecamatan);

                    const distributorInfo = profile.find(profileItem => profileItem.kode === item.id_distributor);
                    return {
                        id: item.id,
                        id_provinsi: item.id_provinsi,
                        provinsi: wilayahInfo ? wilayahInfo.nama : null,
                        id_kabupaten: item.id_kabupaten,
                        kabupaten: kabupatenInfo ? kabupatenInfo.nama : null,
                        id_kecamatan: item.id_kecamatan,
                        kecamatan: kecamatanInfo ? kecamatanInfo.nama : null,
                        id_distributor: item.id_distributor,
                        distributor: distributorInfo ? distributorInfo.nama : null,
                        status: item.status_mapping
                    };
                } else {
                    return null;
                }
            }).filter(distributorData => distributorData !== null);

            // Mengonversi id kios menjadi nama kios
            const petugasData = mappedData.map(item => {
                if (item.id_kios) {
                    const wilayahInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_provinsi);
                    const kabupatenInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_kabupaten);
                    const kecamatanInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_kecamatan);

                    const kiosInfo = profile.find(profileItem => profileItem.kode === item.id_kios);
                    return {
                        id: item.id,
                        id_provinsi: item.id_provinsi,
                        provinsi: wilayahInfo ? wilayahInfo.nama : null,
                        id_kabupaten: item.id_kabupaten,
                        kabupaten: kabupatenInfo ? kabupatenInfo.nama : null,
                        id_kecamatan: item.id_kecamatan,
                        kecamatan: kecamatanInfo ? kecamatanInfo.nama : null,
                        id_kios: item.id_kios,
                        kios: kiosInfo ? kiosInfo.nama : null,
                        status: item.status_mapping
                    };
                } else {
                    return null;
                }
            }).filter(petugasData => petugasData !== null);

            return {
                ...petugasItem,
                gudang: wilayahData,
                distributor: distributorData,
                kios: petugasData
            };
        });

        res.status(200).send(reconstructedData);
    } catch (error) {
        res.status(500).send(`${error}`);
    }

} */
const getall = async (res) => {
    try {

        const allpetugas = await db.tbl_petugas.findMany();

        res.status(200).send(allpetugas);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

const getmapping = async (res) => {
    try {
        // Ambil semua data mapping petugas
        const mappingpetugas = await db.mapping_petugas.findMany({
            select: {
                id: true,
                id_petugas: true,
                id_provinsi: true,
                id_kabupaten: true,
                kategori: true,
                status_mapping: true,
            }
        });

        // Ambil semua data wilayah
        const wilayah = await db.tbl_wilayah.findMany({
            select: {
                id: true,
                kode: true,
                nama: true,
                kode: true,
                status_wilayah: true,
            }
        });

        // Fungsi untuk mengonversi ID wilayah menjadi nama wilayah
        const processMappingPetugas = async (mappedData) => {
            return Promise.all(mappedData.map(async item => {
                const wilayahInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_provinsi);
                const kabupatenInfo = wilayah.find(wilayahItem => wilayahItem.kode === item.id_kabupaten);

                // Ambil detail petugas berdasarkan ID petugas dari mapping petugas
                const petugasInfo = await db.tbl_petugas.findUnique({
                    where: {
                        id: item.id_petugas
                    },
                    select: {
                        id: true,
                        kode_petugas: true,
                        nama_petugas: true,
                        contact: true,
                        contact_wa: true,
                        jabatan: true,
                        status_petugas: true,
                    }
                });

                return {
                    id: item.id,
                    petugas: petugasInfo,
                    id_provinsi: item.id_provinsi,
                    provinsi: wilayahInfo ? wilayahInfo.nama : null,
                    id_kabupaten: item.id_kabupaten,
                    kabupaten: kabupatenInfo ? kabupatenInfo.nama : null,
                    kategori: item.kategori,
                    status_mapping: item.status_mapping
                };
            }));
        };

        // Proses mapping petugas berdasarkan wilayah
        const reconstructedData = {
            provinsi: await processMappingPetugas(mappingpetugas.filter(item => item.id_provinsi)),
            kabupaten: await processMappingPetugas(mappingpetugas.filter(item => item.id_kabupaten))
        };

        res.status(200).send(reconstructedData);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

const search = async (request) => {
    const skip = (request.page - 1) * parseInt(request.size);

    const filters = [];

    if (request.kode_petugas) {
        filters.push({
            kode_petugas: {
                contains: request.kode_petugas
            }
        });
    }

    if (request.nama_petugas) {
        filters.push({
            nama_petugas: {
                contains: request.nama_petugas
            }
        });
    }
    if (request.contact) {
        filters.push({
            contact: {
                contains: request.contact
            }
        });
    }

    const petugas = await db.tbl_petugas.findMany({
        where: {
            OR: filters
        },
        take: parseInt(request.size),
        skip: skip
    });

    const totalItems = await db.tbl_petugas.count({
        where: {
            OR: filters
        }
    });

    return {
        data: petugas,
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
    getmonitoring,
    getall,
    getmapping,
    update,
    remove,
    search
}
