import excelToJson from 'convert-excel-to-json'; 
import {db} from "../application/database.js";
import csv from "fast-csv";
import fs from "fs"; 
import path from 'path'; 
import { promisify } from 'util';
import { exec, spawn } from 'child_process';
const execPromisified = promisify(exec);
 
import { createDomain } from 'domain';
import delay from 'delay';
 
const checkFileExists = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) { 
                reject(new Error(`File ${filePath} tidak ditemukan`));
            } else { 
                resolve();
            }
        });
    });
}; 
const captureStdout = async (routine) => {
    const domain = createDomain();
  
    domain.outputInterceptor = '';
  
    await domain.run(() => {
      return routine();
    });
  
    const output = domain.outputInterceptor;
  
    domain.outputInterceptor = undefined;
  
    return output;
};
const executePythonScript = (command, onData) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = exec(command, { maxBuffer: Infinity });

        pythonProcess.stdout.on('data', (data) => {
            onData(data.toString().trim());
        });

        pythonProcess.stderr.on('data', (data) => {
            const error = data.toString().trim();
            if (!error.startsWith('INFO')) {  
                reject(new Error(error));
            }
        });
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Python process exited with code ${code}`));
            } else {
                resolve();
            }
        });
    });
}; 
const extractRowsProcessed = (output) => {
    if (!output || typeof output !== 'string') {
        console.error('Output is not a valid string');
        return null;
    } 
    const match = output.match(/Processed (\d+) rows/);
    if (match) {
        return parseInt(match[1]);
    } else {
        console.error('Failed to extract processed rows from output');
        return null;
    }
};
 
const uploadService = {
    processUploadedFile: async (file) => {
        try {
            // Membaca file Excel menggunakan pustaka convert-excel-to-json
            const excelData = excelToJson({
                sourceFile: file.path,
            });
 
            const sheetData = excelData[Object.keys(excelData)[0]];
 
            const columnMapping = {
                'Kode Produsen': 'kode_produsen',
                'Produsen': 'produsen',
                'No F5': 'nomor_f5',
                'Kode Distributor': 'kode_distributor',
                'Nama Distributor': 'nama_distributor',
                'Tahun': 'tahun',
                'Bulan': 'bulan',
                'Kode Provinsi': 'kode_provinsi',
                'Provinsi': 'provinsi',
                'Kode Kabupaten': 'kode_kabupaten',
                'Kabupaten': 'kabupaten',
                'Status': 'status',
                'Kode Produk': 'kode_produk',
                'Produk': 'produk',
                'Stok Awal': 'stok_awal',
                'Penebusan': 'penebusan',
                'Penyaluran': 'penyaluran',
                'Stok Akhir': 'stok_akhir',
                'Keterangan': 'keterangan'  
            };

           
            const jsonData = sheetData.slice(1).map(row => {
                const obj = {};
                const parameterJSON = sheetData[0];
                // console.log("parameterJSON:", parameterJSON);
                Object.keys(parameterJSON).forEach(key => { 
                    const columnNameInExcel = parameterJSON[key];  
                    // console.log("columnNameInExcel:", columnNameInExcel);
                    if (columnMapping.hasOwnProperty(columnNameInExcel.trim())) {

                        obj[columnMapping[columnNameInExcel]] = row[key];
                    } else {
                        obj[columnNameInExcel.trim().toLowerCase()] = null ;
                    }

                }); 
                return obj;
            });
             
            console.log("Data from Excel file:", jsonData);
 
            return { success: true, message: "Data from Excel file retrieved successfully", data: jsonData };
        } catch (error) { 
            console.error("Error processing uploaded Excel file:", error);
            throw error;
        }
    },
    /* processUploadedFileTebus: async (file) => {
        try {
          
            const excelData = excelToJson({
                sourceFile: file.path,
            });
 
            const sheetData = excelData[Object.keys(excelData)[0]];
 
            const parameterJSON = sheetData[0];
 
            const jsonData = sheetData.slice(1).map(row => {
                const obj = {};
                Object.keys(parameterJSON).forEach(key => {
                    obj[parameterJSON[key].trim().toLowerCase()] = row[key];
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
    }, */
    /* processUploadedFileSalur: async (file) => {
        try {
          
            const excelData = excelToJson({
                sourceFile: file.path,
            });
 
            const sheetData = excelData[Object.keys(excelData)[0]];
 
            const parameterJSON = sheetData[0];
 
            const jsonData = sheetData.slice(1).map(row => {
                const obj = {};
                Object.keys(parameterJSON).forEach(key => {
                    obj[parameterJSON[key].trim().toLowerCase()] = row[key];
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
    },  */
    processUploadedFileBulanF5: async (file) => {
        try { 
            const today = new Date();
            const formattedDate = today.toISOString();
            
            const uniqueProdusens = new Set();
            const uniqueDistributors = new Set();
            const duplicates = [];

            const stream = fs.createReadStream(file.path);
            const csvStream = csv.parse({
                headers: true,
                delimiter: ';',
                discardUnmappedColumns: true,
                validate: function (data) {
                    // Lakukan validasi di sini
                    for (const key in data) {
                        if (data.hasOwnProperty(key)) {
                            if (!data[key]) {
                                console.log(`Kolom '${key}' kosong pada baris:`, data);
                                return false; // Mengembalikan false jika ada kolom kosong
                            }
                        }
                    }
                    return true; // Mengembalikan true jika semua kolom memiliki nilai
                }
            });
    
            const batchPromises = [];
            const batchSize = 100;
            let batchCount = 0;
            let batchData = [];
    
            const processBatch = async (batch) => {
                const jsonData = batch.map(async (row) => {
                    if (!row[Object.keys(row)[0]]) {
                        // Jika kolom pertama kosong, abaikan baris ini
                        return null;
                    }
    
                    const obj = {};
                    for (const key in row) {
                        if (row.hasOwnProperty(key)) {
                            const value = row[key].trim(); // Ambil nilai dari kolom dan hapus spasi di awal dan akhir
                            if (value !== '') {
                                // Jika nilai tidak kosong, tambahkan ke objek
                                obj[key.trim().toLowerCase()] = value;
                            } else {
                                // Jika nilai kosong, atur nilai default
                                obj[key.trim().toLowerCase()] = null; // Atau ganti dengan nilai default jika diperlukan
                                console.log(`Kolom '${key}' kosong pada baris:`, obj);
                            }
                        }
                    }
    
                    // Lakukan pengecekan jumlah kolom di sini
                    if (Object.keys(obj).length !== 20) {
                        // Tambahkan kolom kosong atau nilai default untuk memastikan jumlah kolom sesuai
                        for (let i = Object.keys(obj).length; i < 20; i++) {
                            obj['column_' + i] = null; // Kolom kosong
                        }
                    }
                     
                    if (obj.produsen && !uniqueProdusens.has(obj.kode_produsen)) {
                        uniqueProdusens.add(obj.kode_produsen);
                        const existingProdusen = await db.produsens.findFirst({
                            where: {
                                kode_produsen: obj.kode_produsen, 
                            },
                        });
                        if (!existingProdusen) {
                            await db.produsens.create({
                                data: {
                                    created_at: formattedDate,
                                    kode_produsen: obj.kode_produsen,
                                    nama_produsen: obj.produsen,
                                },
                            });
                        } else {
                            duplicates.push({ kode_produsen: obj.kode_produsen, produsen: obj.produsen });
                        }
                    }
            
                    if (obj.kode_distributor && !uniqueDistributors.has(obj.kode_distributor)) {
                        uniqueDistributors.add(obj.kode_distributor);
                        const existingDistributor = await db.distributors.findFirst({
                            where: {
                                kode_distributor: obj.kode_distributor,
                            },
                        });
                        if (!existingDistributor) {
                            await db.distributors.create({
                                data: {
                                    created_at: formattedDate,
                                    kode_distributor: obj.kode_distributor,
                                    nama_distributor: obj.nama_distributor,
                                },
                            });
                        } else {
                            duplicates.push({ kode_distributor: obj.kode_distributor, nama_distributor: obj.nama_distributor });
                        }
                    }
                      
                    if (obj.status === "Approve") { 
                        const stok_awal = obj.stok_awal !== undefined ? obj.stok_awal.toString() : '0';
                        const penebusan = obj.stok_awal !== undefined ? obj.stok_awal.toString() : '0';
                        const penyaluran = obj.stok_awal !== undefined ? obj.stok_awal.toString() : '0';
                        const stok_akhir = obj.stok_awal !== undefined ? obj.stok_awal.toString() : '0';

                        return db.bulanF5.create({
                            data: { 
                                created_at : formattedDate,
                                updated_at : null,
                                deleted_at : null,
                                kode_produsen: obj.kode_produsen,
                                produsen: obj.produsen,
                                nomor_f5: obj.nomor_f5,
                                kode_distributor: obj.kode_distributor,
                                nama_distributor: obj.nama_distributor,
                                tahun: obj.tahun,
                                bulan: parseInt(obj.bulan),
                                kode_provinsi: obj.kode_provinsi,
                                provinsi: obj.provinsi,
                                kode_kabupaten: obj.kode_kabupaten,
                                kabupaten: obj.kabupaten,
                                status: obj.status,
                                kode_produk: obj.kode_produk,
                                produk: obj.produk,
                                stok_awal: stok_awal,
                                penebusan : penebusan,
                                penyaluran : penyaluran,
                                stok_akhir : stok_akhir,
                                keterangan : obj.keterangan, 
                                userid : null,
                            },
                        }); 
                    }  
                });
                console.log('Duplicates:', duplicates);
                return Promise.all(jsonData); 
            };
    
            csvStream.on('error', (error) => {
                console.error('Error parsing CSV file:', error);
                throw error;
            });
     
            csvStream.on('data', (row) => {
                // console.log('Data baris:', row); // Tambahkan ini untuk melihat nilai row
                batchData.push(row);
                if (batchData.length === batchSize) {
                    batchPromises.push(processBatch(batchData.slice()));
                    batchData = [];
                    batchCount++;
                }
            });
            csvStream.on('end', () => {
                if (batchData.length > 0) {
                    batchPromises.push(processBatch(batchData.slice()));
                    batchCount++;
                }
    
                Promise.all(batchPromises)
                    .then((results) => {
                        const createdData = results.flat().filter((item) => item !== null);
                        console.log('Data processed successfully:', createdData);
                    })
                    .catch((error) => {
                        console.error('Error processing uploaded CSV file:', error);
                        throw error;
                    });
            });
    
            stream.pipe(csvStream);
        } catch (error) {
            console.error('Error processing uploaded CSV file:', error);
            throw error;
        }
    }, 
    processUploadedFileBulanF6: async (file, res) => {
        /* try {
            // Menghubungkan ke database
            await db.$connect();
    
            // Validasi jenis file
            if (!file || !file.path || !file.mimetype || !file.originalname) {
                throw new Error('File tidak valid.');
            }
    
            // Validasi tipe file
            if (file.mimetype !== 'text/csv') {
                throw new Error('Jenis file harus CSV.');
            }
    
            const hariIni = new Date();
            const tanggalTerformat = hariIni.toISOString();
    
            // Path ke file CSV yang diunggah
            const pathFileCSV = file.path;
    
            await checkFileExists(pathFileCSV);
    
            const currentFolder = process.cwd();
            const skripPythonPath = path.join(currentFolder, 'src', 'service', 'proses.py');
    
            const perintah = `python "${skripPythonPath}" "${pathFileCSV}"`;
    
            // const output = await executePythonScript(perintah);
            // console.log("Data CSV berhasil diimpor");
            // res.send("Upload success");
                // Setelah menjalankan skrip Python
                const output = await executePythonScript(perintah);
                console.log("Output from Python script:", output);  // Cetak output dari skrip Python
                // Tangkap informasi jumlah baris yang sudah diproses dari output
                const rowsProcessed = extractRowsProcessed(output);
                console.log("Rows processed:", rowsProcessed);  // Cetak informasi jumlah baris yang sudah diproses
                res.send(`Upload success. ${rowsProcessed} rows processed.`);
    
        } catch (error) {
            console.error('Error saat memproses file CSV yang diunggah:', error);
            res.status(500).json({ error: 'Kesalahan server internal' });
        } finally {
            // Menutup koneksi dalam blok finally untuk menangani kesalahan
            await db.$disconnect();
        } */
        // let rowsProcessed = 0;
        try {
            // Menghubungkan ke database
            let rowsProcessed = 0;
            await db.$connect();
            // Validasi jenis file
            if (!file || !file.path || !file.mimetype || !file.originalname) {
                throw new Error('File tidak valid.');
            }
    
            // Validasi tipe file
            if (file.mimetype !== 'text/csv') {
                throw new Error('Jenis file harus CSV.');
            }
    
            const hariIni = new Date();
            const tanggalTerformat = hariIni.toISOString();
    
            // Path ke file CSV yang diunggah
            const pathFileCSV = file.path;
    
            await checkFileExists(pathFileCSV);
    
            const currentFolder = process.cwd();
            const skripPythonPath = path.join(currentFolder, 'src', 'service', 'proses.py');
    
            const perintah = `python "${skripPythonPath}" "${pathFileCSV}"`;
           
            await executePythonScript(perintah, (output) => {
                const match = output.match(/Processed (\d+) rows/);
                if (match) {
                    rowsProcessed = parseInt(match[1]);
                    console.log(`Rows processed: ${rowsProcessed}`);
                }
            });

            console.log('Data insertion completed.');
            // Jalankan skrip Python dan tangkap outputnya
            // const output = await executePythonScript(perintah);
            // console.log("Output from Python script:", output); 
            // Tangkap informasi jumlah baris yang sudah diproses dari output
            // const rowsProcessed = extractRowsProcessed(output);
            // console.log("Rows processed:", rowsProcessed);
    
            // Hanya panggil res.send setelah semua proses selesai
             res.send(`Upload success. ${rowsProcessed} rows processed.`);
    
        }  catch (error) {
            console.error('Error saat memproses file CSV yang diunggah:', error);
            res.status(500).json({ error: 'Kesalahan server internal' });
        } finally {
            await db.$disconnect();
        }
    }, 
    processUploadedFileSalur: async (file, res) => { 
        let startTime; // Deklarasikan variabel startTime di luar blok try
    
        try {
            // Menghubungkan ke database
            let rowsProcessed = 0;
            await db.$connect();
            // Validasi jenis file
            if (!file || !file.path || !file.mimetype || !file.originalname) {
                throw new Error('File tidak valid.');
            }
    
            // Validasi tipe file
            if (file.mimetype !== 'text/csv') {
                throw new Error('Jenis file harus CSV.');
            }
    
            const hariIni = new Date();
            const tanggalTerformat = hariIni.toISOString();
    
            // Path ke file CSV yang diunggah
            const pathFileCSV = file.path;
    
            await checkFileExists(pathFileCSV);
    
            const currentFolder = process.cwd(); 
    
            const pythonScript = spawn('python', [path.join(currentFolder, 'src', 'service', 'proses_salur.py'), pathFileCSV]);
    
            pythonScript.stdout.on('data', (data) => {
                const matchStartTime = data.toString().match(/startTime:(\d+\.\d+)/); // Mendapatkan startTime dari output
                if (matchStartTime) {
                    startTime = parseFloat(matchStartTime[1]); // Mengonversi startTime menjadi angka float
                    console.log(`startTime: ${startTime}`);
                } else {
                    console.log(data.toString()); // Cetak output lainnya
                }
            });
    
            pythonScript.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
    
            pythonScript.on('close', (code) => {
                if (code === 0) {
                    const endTime = Date.now();
                    const elapsedTime = (endTime - startTime) / 1000; // Ubah milidetik menjadi detik
                    res.send(`File uploaded and data imported successfully. Time taken: ${elapsedTime} seconds.`);
                } else {
                    res.status(500).send('Error importing data into PostgreSQL.');
                }
            });
    
        }  catch (error) {
            console.error('Error saat memproses file CSV yang diunggah:', error);
            res.status(500).json({ error: 'Kesalahan server internal' });
        } finally {
            await db.$disconnect();
        }
    }, 
    processUploadedFileTebus: async (file, res) => { 
        let startTime; // Deklarasikan variabel startTime di luar blok try
    
        try {
            // Menghubungkan ke database
            let rowsProcessed = 0;
            await db.$connect();
            // Validasi jenis file
            if (!file || !file.path || !file.mimetype || !file.originalname) {
                throw new Error('File tidak valid.');
            }
    
            // Validasi tipe file
            if (file.mimetype !== 'text/csv') {
                throw new Error('Jenis file harus CSV.');
            }
    
            const hariIni = new Date();
            const tanggalTerformat = hariIni.toISOString();
    
            // Path ke file CSV yang diunggah
            const pathFileCSV = file.path;
    
            await checkFileExists(pathFileCSV);
    
            const currentFolder = process.cwd(); 
    
            const pythonScript = spawn('python', [path.join(currentFolder, 'src', 'service', 'proses_tebus.py'), pathFileCSV]);
    
            pythonScript.stdout.on('data', (data) => {
                const matchStartTime = data.toString().match(/startTime:(\d+\.\d+)/); // Mendapatkan startTime dari output
                if (matchStartTime) {
                    startTime = parseFloat(matchStartTime[1]); // Mengonversi startTime menjadi angka float
                    console.log(`startTime: ${startTime}`);
                } else {
                    console.log(data.toString()); // Cetak output lainnya
                }
            });
    
            pythonScript.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
    
            pythonScript.on('close', (code) => {
                if (code === 0) {
                    const endTime = Date.now();
                    const elapsedTime = (endTime - startTime) / 1000; // Ubah milidetik menjadi detik
                    res.send(`File uploaded and data imported successfully. Time taken: ${elapsedTime} seconds.`);
                } else {
                    res.status(500).send('Error importing data into PostgreSQL.');
                }
            });
    
        }  catch (error) {
            console.error('Error saat memproses file CSV yang diunggah:', error);
            res.status(500).json({ error: 'Kesalahan server internal' });
        } finally {
            await db.$disconnect();
        }
    }, 
}; 
export default uploadService;
