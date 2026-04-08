const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer'); // TAMBAHAN: Import library email
require('dotenv').config(); // TAMBAHAN: Buat baca file .env

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

// 6. LOGIN (DIUBAH: ADA PENGECEKAN OTP)
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

// 7. REGISTER (DIUBAH: GENERATE OTP & KIRIM EMAIL)
app.post('/api/register', (req, res) => {
    const { nama, email, password, no_hp } = req.body;
    if (!email || !password) return res.json({ status: "Fail", message: "Email/Password wajib diisi!" });

    db.query("SELECT id FROM users WHERE email = ?", [email], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length > 0) return res.json({ status: "Fail", message: "Email sudah terdaftar!" });

        // Generate 4 digit angka acak (contoh: 8492)
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

        // Insert ke DB (tambah otp_code dan set is_verified = 0)
        const sql = "INSERT INTO users (nama_lengkap, email, password, no_hp, role, otp_code, is_verified) VALUES (?, ?, ?, ?, 'penyewa', ?, 0)";
        db.query(sql, [nama, email, password, no_hp, otpCode], (err) => {
            if (err) return res.status(500).json(err);

            // Settingan Email OTP
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Kode OTP Registrasi Kost Dykaya',
                text: `Halo ${nama},\n\nTerima kasih telah mendaftar di Kost Dykaya.\n\nKode OTP pendaftaran Anda adalah: ${otpCode}\n\nSilakan masukkan kode ini di aplikasi untuk mengaktifkan akun Anda.`
            };

            // Kirim Emailnya
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

// 7.5. VERIFIKASI OTP (RUTE BARU)
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    const sql = "SELECT * FROM users WHERE email = ? AND otp_code = ?";
    db.query(sql, [email, otp], (err, data) => {
        if (err) return res.status(500).json(err);
        
        if (data.length === 0) {
            return res.json({ status: "Fail", message: "Kode OTP salah atau email tidak ditemukan!" });
        }

        // Kalau benar, aktifkan is_verified = 1 dan hapus otp_code
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
        DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL 30 DAY) as jatuh_tempo,
        DATEDIFF(DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL 30 DAY), NOW()) as sisa_hari
        FROM transactions t JOIN rooms r ON t.room_id = r.id ORDER BY t.tanggal_transaksi DESC`;
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// 9. BOOKING AWAL (USER)
app.post('/api/book', (req, res) => {
    const { nama, no_hp, room_id, tipe_kamar, user_id } = req.body;
    const keterangan = `Booking ${tipe_kamar} a.n ${nama} (${no_hp})`;
    const sql = "INSERT INTO transactions (user_id, room_id, tanggal_transaksi, jenis_transaksi, jumlah_bayar, bukti_bayar, status_verifikasi, keterangan) VALUES (?, ?, NOW(), 'booking_awal', 0, '-', 'pending', ?)";
    db.query(sql, [user_id, room_id, keterangan], (err) => {
        if (err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

// 10. UPDATE TRANSACTION (ACC/BAYAR)
app.put('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const { status, bukti_img } = req.body;
    let sql = "UPDATE transactions SET status_verifikasi = ? WHERE id = ?";
    let params = [status, id];

    if (status === 'verification') {
        sql = "UPDATE transactions SET status_verifikasi = ?, bukti_bayar = ? WHERE id = ?";
        params = [status, bukti_img, id];
    } else if (status === 'approved') {
        sql = "UPDATE transactions SET status_verifikasi = ?, tanggal_approve = NOW() WHERE id = ?";
    }

    db.query(sql, params, (err) => {
        if (err) return res.status(500).json(err);
        if (status === 'approved' || status === 'rejected') {
            db.query("SELECT room_id FROM transactions WHERE id = ?", [id], (err, data) => {
                if (data.length > 0) {
                    const nextStatus = status === 'approved' ? 'terisi' : 'tersedia';
                    db.query("UPDATE rooms SET status = ? WHERE id = ?", [nextStatus, data[0].room_id]);
                }
            });
        }
        return res.json({ status: "Success" });
    });
});

// 11. HAPUS TRANSAKSI
app.delete('/api/transactions/:id', (req, res) => {
    db.query("SELECT room_id FROM transactions WHERE id = ?", [req.params.id], (err, data) => {
        if (data && data.length > 0) {
            const rid = data[0].room_id;
            db.query("DELETE FROM transactions WHERE id = ?", [req.params.id], (err) => {
                if (err) return res.status(500).json(err);
                db.query("UPDATE rooms SET status = 'tersedia' WHERE id = ?", [rid]);
                return res.json({ status: "Success" });
            });
        } else {
            return res.status(404).json("Data Not Found");
        }
    });
});

// 12. GET MY BILL
app.get('/api/my-bill/:userId', (req, res) => {
    const sql = `
        SELECT t.id as trans_id, t.status_verifikasi, r.nomor_kamar, r.tipe_kamar, r.harga_bulanan,
        DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL 30 DAY) as jatuh_tempo,
        DATEDIFF(DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL 30 DAY), NOW()) as sisa_hari
        FROM transactions t JOIN rooms r ON t.room_id = r.id
        WHERE t.user_id = ? AND t.status_verifikasi != 'rejected' ORDER BY t.tanggal_transaksi DESC LIMIT 1`;
    db.query(sql, [req.params.userId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data.length > 0 ? { status: "Found", data: data[0] } : { status: "NoData" });
    });
});

// 13. KELUHAN (USER & ADMIN)
app.post('/api/complaints', (req, res) => {
    // Tambahin 'tanggal' yang ditangkap dari frontend
    const { user_id, judul, isi, tanggal } = req.body; 
    
    // Masukkan 'tanggal' ke dalam kolom 'tanggal_lapor' di database
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

// HAPUS KELUHAN
app.delete('/api/complaints/:id', (req, res) => {
    db.query("DELETE FROM complaints WHERE id = ?", [req.params.id], (err) => {
        if(err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

// 14. EXPENSES
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

module.exports = app;

if (require.main === module) {
    app.listen(3000, () => console.log('Server jalan di http://localhost:3000'));
}