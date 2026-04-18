const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer'); 
require('dotenv').config(); 

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- SETUP ROBOT PENGIRIM EMAIL (Nodemailer) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- KONEKSI DATABASE (POOLING) ---
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: 4000,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Cek koneksi saat startup
db.getConnection((err, connection) => {
    if (err) console.error("❌ Gagal connect ke Database:", err.message);
    else {
        console.log("✅ Berhasil connect ke Database lewat Pool!");
        connection.release();
    }
});

// --- RUTE API ---

app.get('/', (req, res) => res.send('Backend Kost Dykaya Siap 86! 🚀'));

// 1. GET ALL ROOMS
app.get('/api/rooms', (req, res) => {
    db.query("SELECT * FROM rooms", (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// 2. ADD NEW ROOM
app.post('/api/rooms', (req, res) => {
    const { nomor_kamar, tipe_kamar, harga_bulanan, fasilitas, status, foto_kamar } = req.body; 
    const sql = "INSERT INTO rooms (nomor_kamar, tipe_kamar, harga_bulanan, fasilitas, status, foto_kamar) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [nomor_kamar, tipe_kamar, harga_bulanan, fasilitas, status, foto_kamar], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ status: "Success", id: result.insertId });
    });
});

// 3. UPDATE TIPE (MASSAL)
app.put('/api/rooms/update-tipe', (req, res) => {
    const { tipe_kamar_lama, tipe_kamar_baru, harga_bulanan, fasilitas, foto_kamar } = req.body;
    const sql = "UPDATE rooms SET tipe_kamar=?, harga_bulanan=?, fasilitas=?, foto_kamar=? WHERE tipe_kamar=?";
    db.query(sql, [tipe_kamar_baru, harga_bulanan, fasilitas, foto_kamar, tipe_kamar_lama], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

// 4. UPDATE SATU KAMAR (BERDASARKAN ID)
app.put('/api/rooms/:id', (req, res) => {
    const { id } = req.params;
    const { nomor_kamar, tipe_kamar, harga_bulanan, fasilitas, status, foto_kamar } = req.body;
    const sql = "UPDATE rooms SET nomor_kamar=?, tipe_kamar=?, harga_bulanan=?, fasilitas=?, status=?, foto_kamar=? WHERE id=?";
    db.query(sql, [nomor_kamar, tipe_kamar, harga_bulanan, fasilitas, status, foto_kamar, id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

// 5. HAPUS KAMAR
app.delete('/api/rooms/:id', (req, res) => {
    db.query("DELETE FROM rooms WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

// 6. LOGIN 
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, data) => {
        if(err) return res.status(500).json(err);
        if(data.length > 0) {
            // CEK STATUS OTP
            if (data[0].is_verified === 0) {
                return res.json({ status: "Fail", message: "Akun belum diverifikasi! Silakan cek email Anda untuk OTP." });
            }

            return res.json({ 
                status: "Success", 
                role: data[0].role, 
                userId: data[0].id, 
                name: data[0].nama_lengkap 
            });
        }
        return res.json({ status: "Fail", message: "Email/Password Salah" });
    });
});

// 7. REGISTER 
app.post('/api/register', (req, res) => {
    const { nama, email, password, no_hp } = req.body;
    if (!email || !password) return res.json({ status: "Fail", message: "Email/Password wajib diisi!" });

    db.query("SELECT id FROM users WHERE email = ?", [email], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length > 0) return res.json({ status: "Fail", message: "Email sudah terdaftar!" });

        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        const sql = "INSERT INTO users (nama_lengkap, email, password, no_hp, role, otp_code, is_verified) VALUES (?, ?, ?, ?, 'penyewa', ?, 0)";
        db.query(sql, [nama, email, password, no_hp, otpCode], (err) => {
            if (err) return res.status(500).json(err);

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Kode OTP Registrasi Kost Dykaya',
                text: `Halo ${nama},\n\nTerima kasih telah mendaftar di Kost Dykaya.\n\nKode OTP pendaftaran Anda adalah: ${otpCode}\n\nSilakan masukkan kode ini di aplikasi untuk mengaktifkan akun Anda.`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Gagal kirim email OTP:", error);
                    return res.json({ status: "Fail", message: "Gagal mengirim email OTP, pastikan email aktif." });
                }
                return res.json({ status: "Success", message: "Registrasi berhasil, silakan cek email untuk kode OTP." });
            });
        });
    });
});

// 7.5. VERIFIKASI OTP 
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    const sql = "SELECT * FROM users WHERE email = ? AND otp_code = ?";
    db.query(sql, [email, otp], (err, data) => {
        if (err) return res.status(500).json(err);
        
        if (data.length === 0) {
            return res.json({ status: "Fail", message: "Kode OTP salah atau email tidak ditemukan!" });
        }

        const updateSql = "UPDATE users SET is_verified = 1, otp_code = NULL WHERE email = ?";
        db.query(updateSql, [email], (updateErr) => {
            if (updateErr) return res.status(500).json(updateErr);
            return res.json({ status: "Success", message: "Verifikasi berhasil! Silakan login." });
        });
    });
});

// 8. TRANSAKSI (ADMIN)
app.get('/api/transactions', (req, res) => {
    const sql = `
        SELECT t.*, r.nomor_kamar, r.tipe_kamar, r.harga_bulanan,
        DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL COALESCE(t.durasi_sewa, 1) MONTH) as jatuh_tempo,
        DATEDIFF(DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL COALESCE(t.durasi_sewa, 1) MONTH), NOW()) as sisa_hari
        FROM transactions t JOIN rooms r ON t.room_id = r.id ORDER BY t.tanggal_transaksi DESC`;
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// 9. BOOKING AWAL (USER)
app.post('/api/book', (req, res) => {
    const { nama, no_hp, room_id, tipe_kamar, user_id, durasi } = req.body;
    
    const durasiSewa = durasi || 1; 
    const keterangan = `Booking ${tipe_kamar} (${durasiSewa} Bulan) a.n ${nama} (${no_hp})`;
    
    // UBAH: Status langsung diset ke 'waiting_payment' (Bukan 'pending' lagi)
    const sql = "INSERT INTO transactions (user_id, room_id, tanggal_transaksi, jenis_transaksi, jumlah_bayar, bukti_bayar, status_verifikasi, keterangan, durasi_sewa) VALUES (?, ?, NOW(), 'booking_awal', 0, '-', 'waiting_payment', ?, ?)";
    
    db.query(sql, [user_id, room_id, keterangan, durasiSewa], (err) => {
        if (err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

// 10. GET MY BILL (USER) - VERSI BENAR (DENGAN KALKULASI DURASI)
app.get('/api/my-bill/:userId', (req, res) => {
    const sql = `
        SELECT t.id as trans_id, t.status_verifikasi, t.durasi_sewa, r.nomor_kamar, r.tipe_kamar, r.harga_bulanan,
        DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL COALESCE(t.durasi_sewa, 1) MONTH) as jatuh_tempo,
        DATEDIFF(DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL COALESCE(t.durasi_sewa, 1) MONTH), NOW()) as sisa_hari
        FROM transactions t JOIN rooms r ON t.room_id = r.id
        WHERE t.user_id = ? AND t.status_verifikasi != 'rejected' ORDER BY t.tanggal_transaksi DESC LIMIT 1`;
    db.query(sql, [req.params.userId], (err, data) => {
        if (err) return res.status(500).json(err);
        
        if (data.length > 0) {
            data[0].harga_bulanan = data[0].harga_bulanan * (data[0].durasi_sewa || 1);
            return res.json({ status: "Found", data: data[0] });
        } else {
            return res.json({ status: "NoData" });
        }
    });
});

// 11.5 UPDATE TRANSAKSI (USER/ADMIN)
app.put('/api/transactions/:id', (req, res) => {
    const { status, bukti_img } = req.body;
    const transactionId = req.params.id;

    if (bukti_img) {
        // Skema 1: User upload bukti bayar
        db.query("UPDATE transactions SET status_verifikasi = ?, bukti_bayar = ? WHERE id = ?", [status, bukti_img, transactionId], (err) => {
            if (err) return res.status(500).json(err);
            return res.json({ status: "Success" });
        });
    } else if (status === 'approved') {
        // Skema 2: Admin klik Terima (Approve)
        db.query("UPDATE transactions SET status_verifikasi = ?, tanggal_approve = NOW() WHERE id = ?", [status, transactionId], (err) => {
            if (err) return res.status(500).json(err);
            
            // Otomatis ubah status kamar jadi 'terisi'
            db.query("SELECT room_id FROM transactions WHERE id = ?", [transactionId], (err2, data) => {
                if(data.length > 0) {
                    db.query("UPDATE rooms SET status = 'terisi' WHERE id = ?", [data[0].room_id]);
                }
            });
            return res.json({ status: "Success" });
        });
    } else if (status === 'rejected') {
        // Skema 3: Admin tolak pesanan
        db.query("UPDATE transactions SET status_verifikasi = ? WHERE id = ?", [status, transactionId], (err) => {
            if (err) return res.status(500).json(err);
            
            // Otomatis balikin kamar jadi 'tersedia' lagi
            db.query("SELECT room_id FROM transactions WHERE id = ?", [transactionId], (err2, data) => {
                if(data.length > 0) {
                    db.query("UPDATE rooms SET status = 'tersedia' WHERE id = ?", [data[0].room_id]);
                }
            });
            return res.json({ status: "Success" });
        });
    } else {
        // Skema 4: Update status biasa
        db.query("UPDATE transactions SET status_verifikasi = ? WHERE id = ?", [status, transactionId], (err) => {
            if (err) return res.status(500).json(err);
            return res.json({ status: "Success" });
        });
    }
});

// 12. KELUHAN (USER & ADMIN)
app.post('/api/complaints', (req, res) => {
    const { user_id, judul, isi, tanggal } = req.body; 
    db.query("INSERT INTO complaints (user_id, judul_keluhan, isi_keluhan, tanggal_lapor) VALUES (?, ?, ?, ?)", [user_id, judul, isi, tanggal], (err) => {
        if(err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

app.get('/api/complaints', (req, res) => {
    const sql = "SELECT c.*, u.nama_lengkap, r.nomor_kamar FROM complaints c JOIN users u ON c.user_id = u.id LEFT JOIN transactions t ON (t.user_id = u.id AND t.status_verifikasi = 'approved') LEFT JOIN rooms r ON t.room_id = r.id ORDER BY c.tanggal_lapor DESC";
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.put('/api/complaints/:id', (req, res) => {
    const { status } = req.body;
    db.query("UPDATE complaints SET status = ? WHERE id = ?", [status, req.params.id], (err) => {
        if(err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

app.delete('/api/complaints/:id', (req, res) => {
    db.query("DELETE FROM complaints WHERE id = ?", [req.params.id], (err) => {
        if(err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

// 13. EXPENSES
app.get('/api/expenses', (req, res) => {
    db.query("SELECT * FROM expenses ORDER BY tanggal_pengeluaran DESC", (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.post('/api/expenses', (req, res) => {
    const { nama, biaya, tanggal } = req.body;
    db.query("INSERT INTO expenses (nama_pengeluaran, biaya, tanggal_pengeluaran) VALUES (?, ?, ?)", [nama, biaya, tanggal], (err) => {
        if(err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

// ==========================================
// 14. MINTA OTP UNTUK RESET PASSWORD
// ==========================================
app.post('/api/request-reset-otp', (req, res) => {
    const { email } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json({ status: "Failed", message: "Email tidak terdaftar!" });

        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        db.query('UPDATE users SET otp_code = ? WHERE email = ?', [otpCode, email], (err) => {
            if (err) return res.status(500).json(err);

            const mailOptions = {
                from: `"Kost Dykaya" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Kode OTP Reset Password - Kost Dykaya',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                        <h2>Reset Password Kost Dykaya</h2>
                        <p>Seseorang meminta untuk mereset password akun Anda.</p>
                        <p>Berikut adalah kode OTP Anda (JANGAN BERIKAN KE SIAPAPUN):</p>
                        <h1 style="background: #f1f5f9; padding: 10px; letter-spacing: 5px; color: #2563eb;">${otpCode}</h1>
                        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
                    </div>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) return res.status(500).json({ status: "Failed", message: "Gagal mengirim email OTP" });
                return res.json({ status: "Success", message: "OTP Terkirim" });
            });
        });
    });
});

// ==========================================
// 15. VERIFIKASI OTP & SIMPAN PASSWORD BARU
// ==========================================
app.post('/api/reset-password', (req, res) => {
    const { email, otp_code, new_password } = req.body;

    db.query('SELECT * FROM users WHERE email = ? AND otp_code = ?', [email, otp_code], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(400).json({ status: "Failed", message: "Kode OTP Salah!" });

        db.query('UPDATE users SET password = ?, otp_code = NULL WHERE email = ?', [new_password, email], (err) => {
            if (err) return res.status(500).json(err);
            return res.json({ status: "Success", message: "Password berhasil diubah" });
        });
    });
});

module.exports = app;

if (require.main === module) {
    app.listen(3000, () => console.log('Server jalan di http://localhost:3000'));
}
