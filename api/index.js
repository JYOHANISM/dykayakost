const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
// Penting: Limit besar agar upload bukti transfer (Base64) tidak ditolak Vercel
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- KONEKSI DATABASE (POOLING) ---
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: 4000,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Cek koneksi saat startup (Muncul di Vercel Logs)
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Gagal connect ke Database:", err.message);
    } else {
        console.log("✅ Berhasil connect ke Database lewat Pool!");
        connection.release();
    }
});

// --- RUTE API ---

// Root Testing
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

// 3. EDIT TIPE KAMAR (BULK UPDATE)
app.put('/api/rooms/update-tipe', (req, res) => {
    const { tipe_kamar_lama, tipe_kamar_baru, harga_bulanan, fasilitas, foto_kamar } = req.body;
    const sql = "UPDATE rooms SET tipe_kamar=?, harga_bulanan=?, fasilitas=?, foto_kamar=? WHERE tipe_kamar=?";
    db.query(sql, [tipe_kamar_baru, harga_bulanan, fasilitas, foto_kamar, tipe_kamar_lama], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ status: "Success", message: "Tipe kamar berhasil diupdate" });
    });
});

// 4. DELETE ROOM
app.delete('/api/rooms/:id', (req, res) => {
    db.query("DELETE FROM rooms WHERE id=?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

// 5. LOGIN
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, data) => {
        if(err) return res.status(500).json(err);
        if(data.length > 0) {
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

// 6. REGISTER (DENGAN CEK EMAIL)
app.post('/api/register', (req, res) => {
    const { nama, email, password, no_hp } = req.body;
    
    // 1. Pastikan input tidak kosong
    if (!email || !password) {
        return res.json({ status: "Fail", message: "Email dan Password wajib diisi!" });
    }

    // 2. Cek email dengan lebih teliti
    db.query("SELECT id FROM users WHERE email = ?", [email], (err, data) => {
        if (err) {
            console.error("❌ Database Error saat cek email:", err);
            return res.status(500).json({ status: "Error", message: "Gagal cek database" });
        }

        // PERBAIKAN: Cek apakah data benar-benar ada isinya
        if (data && Array.isArray(data) && data.length > 0) {
            console.log("⚠️ Email sudah ada di DB:", email);
            return res.json({ status: "Fail", message: "Email ini sudah terdaftar, gunakan email lain." });
        }

        // 3. Kalau benar-benar kosong, baru Insert
        const sqlInsert = "INSERT INTO users (nama_lengkap, email, password, no_hp, role) VALUES (?, ?, ?, ?, 'penyewa')";
        db.query(sqlInsert, [nama, email, password, no_hp], (err, result) => {
            if (err) {
                console.error("❌ Error saat Insert User:", err);
                return res.status(500).json({ status: "Error", message: "Gagal mendaftarkan akun baru." });
            }
            console.log("✅ User baru berhasil daftar:", email);
            return res.json({ status: "Success", message: "Registrasi Berhasil!" });
        });
    });
});

// 7. GET ALL TRANSACTIONS (ADMIN)
app.get('/api/transactions', (req, res) => {
    const sql = `
        SELECT t.*, r.nomor_kamar, r.tipe_kamar, r.harga_bulanan,
        DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL 30 DAY) as jatuh_tempo,
        DATEDIFF(DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL 30 DAY), NOW()) as sisa_hari
        FROM transactions t 
        JOIN rooms r ON t.room_id = r.id 
        ORDER BY t.tanggal_transaksi DESC`;
    db.query(sql, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// 8. BOOKING AWAL (USER)
app.post('/api/book', (req, res) => {
    const { nama, no_hp, room_id, tipe_kamar, user_id } = req.body;
    const keterangan = `Booking ${tipe_kamar} a.n ${nama} (${no_hp})`;
    const sql = "INSERT INTO transactions (user_id, room_id, tanggal_transaksi, jenis_transaksi, jumlah_bayar, bukti_bayar, status_verifikasi, keterangan) VALUES (?, ?, NOW(), 'booking_awal', 0, '-', 'pending', ?)";
    db.query(sql, [user_id || 1, room_id, keterangan], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

// 9. UPDATE TRANSACTION (VERIFIKASI / APPROVE)
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
        params = [status, id];
    }

    db.query(sql, params, (err, result) => {
        if (err) return res.status(500).json(err);
        
        // Logika Update Status Kamar otomatis
        if (status === 'approved' || status === 'rejected') {
            const getRoomSql = "SELECT room_id FROM transactions WHERE id = ?";
            db.query(getRoomSql, [id], (err, data) => {
                if (data.length > 0) {
                    const roomId = data[0].room_id;
                    const nextStatus = status === 'approved' ? 'terisi' : 'tersedia';
                    db.query("UPDATE rooms SET status = ? WHERE id = ?", [nextStatus, roomId]);
                }
            });
        }
        return res.json({ status: "Success" });
    });
});

// 10. GET MY BILL (USER DASHBOARD)
app.get('/api/my-bill/:userId', (req, res) => {
    const sql = `
        SELECT t.id as trans_id, t.status_verifikasi, r.nomor_kamar, r.tipe_kamar, r.harga_bulanan,
        DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL 30 DAY) as jatuh_tempo,
        DATEDIFF(DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL 30 DAY), NOW()) as sisa_hari
        FROM transactions t 
        JOIN rooms r ON t.room_id = r.id
        WHERE t.user_id = ? AND t.status_verifikasi != 'rejected' 
        ORDER BY t.tanggal_transaksi DESC LIMIT 1`;
    db.query(sql, [req.params.userId], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.json({ status: "NoData" });
        return res.json({ status: "Found", data: data[0] });
    });
});

// 11. COMPLAINTS
app.post('/api/complaints', (req, res) => {
    const { user_id, judul, isi } = req.body;
    db.query("INSERT INTO complaints (user_id, judul_keluhan, isi_keluhan) VALUES (?, ?, ?)", [user_id, judul, isi], (err, result) => {
        if(err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

app.get('/api/complaints', (req, res) => {
    const sql = `
        SELECT c.*, u.nama_lengkap, r.nomor_kamar 
        FROM complaints c 
        JOIN users u ON c.user_id = u.id 
        LEFT JOIN transactions t ON (t.user_id = u.id AND t.status_verifikasi = 'approved') 
        LEFT JOIN rooms r ON t.room_id = r.id 
        ORDER BY c.tanggal_lapor DESC`;
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

// 12. EXPENSES
app.get('/api/expenses', (req, res) => {
    db.query("SELECT * FROM expenses ORDER BY tanggal_pengeluaran DESC", (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.post('/api/expenses', (req, res) => {
    const { nama, biaya, tanggal } = req.body;
    db.query("INSERT INTO expenses (nama_pengeluaran, biaya, tanggal_pengeluaran) VALUES (?, ?, ?)", [nama, biaya, tanggal], (err, result) => {
        if(err) return res.status(500).json(err);
        return res.json({ status: "Success" });
    });
});

// EXPORT UNTUK VERCEL
module.exports = app;

// Listen untuk Localhost (Jika butuh test offline)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server jalan di http://localhost:${PORT}`));
}