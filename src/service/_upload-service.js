import excelToJson from 'convert-excel-to-json';

const uploadService = {
    processUploadedFile: async (file) => {
        try {
            // Membaca file Excel menggunakan pustaka convert-excel-to-json
            const excelData = excelToJson({
                sourceFile: file.path,
            });

            // Mengambil data dari sheet pertama (biasanya indeks 0)
            const sheetData = excelData[Object.keys(excelData)[0]];

            // Mengambil baris pertama sebagai parameter JSON
            const parameterJSON = sheetData[0];

            // Mengonversi setiap baris data menjadi objek dengan menggunakan nama parameter dari baris pertama
            const jsonData = sheetData.slice(1).map(row => {
                const obj = {};
                Object.keys(parameterJSON).forEach(key => {
                    obj[parameterJSON[key]] = row[key];
                });
                return obj;
            });

            // Di sini Anda bisa melakukan apa pun dengan data yang Anda ambil dari file Excel
            console.log("Data from Excel file:", jsonData);

            // Anda juga dapat mengembalikan data jika diperlukan
            return { success: true, message: "Data from Excel file retrieved successfully", data: jsonData };
        } catch (error) {
            // Tangani kesalahan jika terjadi
            console.error("Error processing uploaded Excel file:", error);
            throw error;
        }
    }
};

export default uploadService;
