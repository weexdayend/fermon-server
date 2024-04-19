import excelToJson from 'convert-excel-to-json'; 
import {db} from "../application/database.js";
import csv from "fast-csv";
import fs from "fs"; 
import path from 'path'; 
import { promisify } from 'util';
import { exec } from 'child_process'; 
const execPromisified = promisify(exec);
 
import { createDomain } from 'domain';
import delay from 'delay';

// Fungsi untuk memeriksa keberadaan file
const checkFileExists = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // File tidak ditemukan
                reject(new Error(`File ${filePath} tidak ditemukan`));
            } else {
                // File ditemukan
                resolve();
            }
        });
    });
};
// Fungsi untuk menangkap output stdout 
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
            if (!error.startsWith('INFO')) { // Memeriksa apakah pesan bukan merupakan pesan INFO
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

    // Lakukan proses ekstraksi di sini
    // Misalnya:
    const match = output.match(/Processed (\d+) rows/);
    if (match) {
        return parseInt(match[1]);
    } else {
        console.error('Failed to extract processed rows from output');
        return null;
    }
}; 
const locationService = {  
    location : async (file, res) => {
        try {
            // Ambil data dari tabel tertentu menggunakan Prisma
            const profiles = await db.profile.findMany();

            // Membuat objek untuk menyimpan hasil rekonstruksi berdasarkan kategori
            const reconstructedProfiles = {};

            // Memproses setiap profil
            profiles.forEach(profile => {
                const { kategori } = profile;

                // Jika kategori belum ada di objek reconstructedProfiles, inisialisasikan sebagai array kosong
                if (!reconstructedProfiles[kategori]) {
                reconstructedProfiles[kategori] = [];
                }

                // Tambahkan profil ke dalam array sesuai kategori
                reconstructedProfiles[kategori].push(profile);
            });
    
            // Lakukan operasi lain sesuai kebutuhan, seperti mengirimkan data ke respon
            res.status(200).json(reconstructedProfiles);
        } catch (error) {
            console.error('Error saat memproses file CSV yang diunggah:', error);
            res.status(500).json({ error: 'Kesalahan server internal' });
        } finally {
            await db.$disconnect();
        }
    },
}; 
export default locationService;
