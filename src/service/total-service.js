import { db } from "../application/database.js";  
const today = new Date();
const formattedDate = today.toISOString();

 
const gettotal = async (res) => {
    try {
        let provinsiCount;
        let kabCount;
        let kecCount;
        let gudangCount;
        let distributorCount;
        let kiosCount;
        let userCount;
        let petugasCount;
        await db.$transaction(async (db) => {
            const resultprov = await db.$queryRaw`
                SELECT count(*) as count FROM fact_provinsi;
            `; 
            provinsiCount = resultprov[0].count;

            const resultkab = await db.$queryRaw`
                SELECT count(*) as count FROM fact_kab_kota;
            `; 
            kabCount = resultkab[0].count;

            const resultkec = await db.$queryRaw`
                SELECT count(*) as count FROM fact_kecamatan;
            `; 
            kecCount = resultkec[0].count;

            const resultgudang = await db.$queryRaw`
                SELECT count(*) as count FROM fact_gudang;
            `; 
            gudangCount = resultgudang[0].count;

            const resultdist = await db.$queryRaw`
                SELECT count(*) as count FROM fact_distributor;
            `; 
            distributorCount = resultdist[0].count;

            const resultkios = await db.$queryRaw`
                SELECT count(*) as count FROM fact_kios;
            `; 
            kiosCount = resultkios[0].count;

            const resultuser = await db.$queryRaw`
                SELECT count(*) as count FROM tbl_user;
            `; 
            userCount = resultuser[0].count;

            const resultpetugas = await db.$queryRaw`
                SELECT count(*) as count FROM fact_petugas;
            `; 
            petugasCount = resultpetugas[0].count;
        });

        const result = [
            {
                "keterangan" : "Provinsi",
                "total" : provinsiCount.toString()
            },
            {
                "keterangan" : "Kabupaten/Kota",
                "total" : kabCount.toString()
            },
            {
                "keterangan" : "Kecamatan",
                "total" : kecCount.toString()
            },
            {
                "keterangan" : "Gudang",
                "total" : gudangCount.toString()
            },
            {
                "keterangan" : "Distributor",
                "total" : distributorCount.toString()
            },
            {
                "keterangan" : "Kios",
                "total" : kiosCount.toString()
            },
            {
                "keterangan" : "User",
                "total" : userCount.toString()
            },
            {
                "keterangan" : "Petugas",
                "total" : petugasCount.toString()
            }
        ]
        // Convert BigInt to string or number before sending in the response
        res.status(200).send(result); // Or use Number(provinsiCount)
    } catch (error) {
        res.status(500).send(error.message);
    }
}

 
export default { 
    gettotal 
}
