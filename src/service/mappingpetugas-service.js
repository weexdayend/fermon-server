import {db} from "../application/database.js"; 
  
const today = new Date();
const formattedDate = today.toISOString();

const create = async (request, res) => {
    const { 
        kode_petugas, 
        kode_provinsi, 
        kode_kab_kota   
     } = request;
    try {
        let newPetugas;

        await db.$transaction(async (db) => {
            newPetugas = await db.mapping_petugas.create({
                data: {
                    created_at: formattedDate,
                    kode_petugas: kode_petugas,
                    kode_provinsi: kode_provinsi,
                    kode_kab_kota: kode_kab_kota, 
                    status_mapping: true,
                }
            });
        });

        res.status(200).send(newPetugas);
    } catch (error) {
        res.status(500).send(`${error}`);
    }
}

const update = async (request, res) => {

    const { 
        id, 
        kode_petugas, 
        kode_provinsi, 
        kode_kab_kota   
    } = request;

    try {
        let updatedPetugas;

        await db.$transaction(async (db) => {
            // Cari data petugas berdasarkan ID
            const existingPetugas = await db.mapping_petugas.findUnique({
                where: {
                    id: id
                }
            });

            // Jika petugas tidak ditemukan, lempar error
            if (!existingPetugas) {
                throw new Error('Mapping petugas not found');
            }

            // Lakukan update data petugas
            updatedPetugas = await db.mapping_petugas.update({
                where: {
                    id: id
                },
                data: {
                    updated_at: formattedDate,
                    kode_petugas, 
                    kode_provinsi, 
                    kode_kab_kota   
                }
            });
        });

        res.status(200).send(updatedPetugas);
    } catch (error) {
        res.status(500).send(`${error}`);
    }  
}

const get = async (request, res) => {
    const { kode } = request;
     
    try {
        let allRekonstruksiData = [];
        let filter = {};
        
        if (kode !== '' && kode !== null) {
            filter.kode_petugas = kode; // Anda mungkin ingin menggunakan kode_petugas atau kode_distributor, sesuai dengan kebutuhan
        }
        
        await db.$transaction(async (db) => {
            const [provinsi, kabupaten, petugas, mapping] = await Promise.all([
                db.fact_provinsi.findMany(),
                db.fact_kab_kota.findMany(),
                db.fact_petugas.findMany(),
                db.mapping_petugas.findMany({
                    where: filter // Menambahkan filter ke permintaan pencarian
                })
            ]);

            allRekonstruksiData = mapping.map(mapp => {
                const wilayahProvinsi = provinsi.find(w => w.kode_provinsi === mapp.kode_provinsi);
                const wilayahKabupaten = kabupaten.find(w => w.kode_kab_kota === mapp.kode_kab_kota); 
                const petugasData = petugas.find(g => g.kode_petugas === mapp.kode_petugas);
 
                return {
                    kode_petugas: petugasData.kode_petugas, // Ini mungkin kode_distributor, sesuai dengan tabel faktual Anda
                    nama_petugas: petugasData.nama_petugas, // Ini mungkin nama_distributor, sesuai dengan tabel faktual Anda
                    contact: petugasData.contact,
                    contact_wa: petugasData.contact_wa,
                    jabatan: petugasData.jabatan,
                    departemen: petugasData.departemen,
                    status_kepegawaian: petugasData.status_kepegawaian, 
                    kode_provinsi: mapp.kode_provinsi,
                    provinsi: wilayahProvinsi ? wilayahProvinsi.nama_provinsi : null,
                    kode_kab_kota: mapp.kode_kab_kota,
                    kabupaten: wilayahKabupaten ? wilayahKabupaten.nama_kab_kota : null, 
                };
            });
        });

        res.status(200).send(allRekonstruksiData);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`); // Menambahkan pesan kesalahan yang lebih deskriptif
    }
}
 
export default {
    create,
    get, 
    update, 
}
