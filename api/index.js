const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

// --- PERBAIKAN UTAMA DISINI BRO! ---
// Kita perbesar batas upload jadi 50MB biar foto HD muat masuk
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const db = mysql.createConnection({
    // Sekarang ambil dari Environment Variables Vercel
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 4000,
    
    // --- INI YANG WAJIB ADA UNTUK TIDB CLOUD ---
    ssl: {
        rejectUnauthorized: false 
    }
});

db.connect((err) => {
    if (err) console.error('❌ Gagal connect ke Database:', err);
    else console.log('✅ Berhasil connect ke Database db_kost_dykaya');
});

// --- RUTE API ---

app.get('/', (req, res) => res.send('Backend Kost Dykaya Siap 86! 🚀'));

app.get('/api/rooms', (req, res) => {
    db.query("SELECT * FROM rooms", (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.post('/api/book', (req, res) => {
    const { nama, no_hp, room_id, tipe_kamar, user_id } = req.body;
    const finalUserId = user_id ? user_id : 1;
    
    const sql = "INSERT INTO transactions (user_id, room_id, tanggal_transaksi, jenis_transaksi, jumlah_bayar, bukti_bayar, status_verifikasi, keterangan) VALUES (?, ?, NOW(), 'booking_awal', 0, '-', 'pending', ?)";
    const keterangan = `Booking ${tipe_kamar} a.n ${nama} (${no_hp})`;

    db.query(sql, [finalUserId, room_id, keterangan], (err, result) => {
        if (err) return res.status(500).json("Gagal Booking");
        return res.json({ status: "Success", message: "Booking berhasil dicatat!" });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, data) => {
        if(err) return res.status(500).json("Error");
        if(data.length > 0) {
            const user = data[0];
            return res.json({ status: "Success", role: user.role, userId: user.id, name: user.nama_lengkap });
        } else {
            return res.json({ status: "Fail", message: "Email/Password Salah" });
        }
    });
});

app.post('/api/register', (req, res) => {
    const { nama, email, password, no_hp } = req.body;
    const checkSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkSql, [email], (err, data) => {
        if (err) return res.status(500).json("Error server");
        if (data.length > 0) return res.json({ status: "Fail", message: "Email sudah terdaftar!" });

        const insertSql = "INSERT INTO users (nama_lengkap, email, password, no_hp, role) VALUES (?, ?, ?, ?, 'penyewa')";
        db.query(insertSql, [nama, email, password, no_hp], (err, result) => {
            if (err) return res.status(500).json("Gagal register");
            return res.json({ status: "Success", message: "Akun berhasil dibuat!" });
        });
    });
});

// E. AMBIL SEMUA DATA PESANAN (UNTUK ADMIN)
app.get('/api/transactions', (req, res) => {
    const sql = `
        SELECT 
            t.id, 
            t.tanggal_transaksi, 
            t.status_verifikasi, 
            t.keterangan, 
            t.tanggal_approve, 
            t.bukti_bayar,  -- <--- WAJIB ADA INI BIAR GAMBAR MUNCUL
            r.nomor_kamar, 
            r.tipe_kamar, 
            r.harga_bulanan,
            DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL 30 DAY) as jatuh_tempo,
            DATEDIFF(DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL 30 DAY), NOW()) as sisa_hari
        FROM transactions t 
        JOIN rooms r ON t.room_id = r.id 
        ORDER BY t.tanggal_transaksi DESC
    `;

    db.query(sql, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Gagal ambil data transaksi");
        }
        return res.json(data);
    });
});

// F. UPDATE STATUS & SIMPAN BUKTI TRANSFER 📸
app.put('/api/transactions/:id', (req, res) => {
    const { id } = req.params;      
    const { status, bukti_img } = req.body; 

    // --- CCTV LOGGING (LIHAT DI TERMINAL VS CODE) ---
    console.log(`📡 Request masuk untuk ID: ${id}, Status: ${status}`);
    if (bukti_img) {
        console.log(`📸 Ada foto masuk! Panjang kodenya: ${bukti_img.length} karakter`);
    } else {
        console.log("⚠️ TIDAK ADA FOTO yang dikirim!");
    }
    // ------------------------------------------------

    let sqlUpdateTrans = "";
    let params = [];

    // ... (lanjutkan kodingan bawahnya sama persis kayak sebelumnya)

    if (status === 'verification') {
        // Kalau User Upload Bukti -> Simpan Fotonya
        sqlUpdateTrans = "UPDATE transactions SET status_verifikasi = ?, bukti_bayar = ? WHERE id = ?";
        params = [status, bukti_img, id];
    } 
    else if (status === 'approved') {
        // Kalau Admin Terima -> Set Tanggal Mulai (Argo Jalan)
        sqlUpdateTrans = "UPDATE transactions SET status_verifikasi = ?, tanggal_approve = NOW() WHERE id = ?";
        params = [status, id];
    } 
    else {
        // Status lain (waiting_payment/rejected)
        sqlUpdateTrans = "UPDATE transactions SET status_verifikasi = ? WHERE id = ?";
        params = [status, id];
    }

    db.query(sqlUpdateTrans, params, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json("Gagal update database");
        }

        // Update Status Kamar (Hanya jika Approved/Rejected)
        const sqlGetRoom = "SELECT room_id FROM transactions WHERE id = ?";
        db.query(sqlGetRoom, [id], (err, data) => {
            if (data.length > 0) {
                const roomId = data[0].room_id;
                let statusKamar = '';
                if (status === 'approved') statusKamar = 'terisi';
                else if (status === 'rejected') statusKamar = 'tersedia';

                if (statusKamar) {
                    const sqlUpdateRoom = "UPDATE rooms SET status = ? WHERE id = ?";
                    db.query(sqlUpdateRoom, [statusKamar, roomId]);
                }
            }
        });
        return res.json({ status: "Success", message: "Berhasil update!" });
    });
});

app.put('/api/transactions/update/:id', (req, res) => {
    const { id } = req.params;
    const { keterangan } = req.body;
    const sql = "UPDATE transactions SET keterangan = ? WHERE id = ?";
    db.query(sql, [keterangan, id], (err, result) => {
        if(err) return res.status(500).json("Gagal update data");
        return res.json({ status: "Success", message: "Data berhasil diubah" });
    });
});

app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const sqlGetRoom = "SELECT room_id FROM transactions WHERE id = ?";
    db.query(sqlGetRoom, [id], (err, data) => {
        if(data.length > 0) {
            const roomId = data[0].room_id;
            const sqlDelete = "DELETE FROM transactions WHERE id = ?";
            db.query(sqlDelete, [id], (err, result) => {
                if(err) return res.status(500).json("Gagal hapus data");
                const sqlUpdateRoom = "UPDATE rooms SET status = 'tersedia' WHERE id = ?";
                db.query(sqlUpdateRoom, [roomId]);
                return res.json({ status: "Success", message: "Data dihapus" });
            });
        } else {
            return res.status(404).json("Data tidak ditemukan");
        }
    });
});

// G. CEK TAGIHAN USER (MODE DEBUG) 🕵️
app.get('/api/my-bill/:userId', (req, res) => {
    const { userId } = req.params;
    console.log("🔍 Mengecek tagihan untuk User ID:", userId); // <-- LOG 1

    const sql = `
        SELECT 
            t.id as trans_id, 
            t.status_verifikasi,
            COALESCE(t.tanggal_approve, t.tanggal_transaksi) as start_date,
            r.nomor_kamar, r.tipe_kamar, r.harga_bulanan,
            DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL 30 DAY) as jatuh_tempo,
            DATEDIFF(DATE_ADD(COALESCE(t.tanggal_approve, t.tanggal_transaksi), INTERVAL 30 DAY), NOW()) as sisa_hari
        FROM transactions t
        JOIN rooms r ON t.room_id = r.id
        WHERE t.user_id = ? AND t.status_verifikasi != 'rejected' 
        ORDER BY t.tanggal_transaksi DESC LIMIT 1
    `;
    
    db.query(sql, [userId], (err, data) => {
        if (err) {
            console.error("❌ Error SQL:", err);
            return res.status(500).json(err);
        }
        console.log("✅ Data ditemukan:", data.length, "baris"); // <-- LOG 2
        
        if (data.length === 0) return res.json({ status: "NoData" });
        return res.json({ status: "Found", data: data[0] });
    });
});

// J. API KELUHAN
app.post('/api/complaints', (req, res) => {
    const { user_id, judul, isi } = req.body;
    const sqlCek = "SELECT * FROM transactions WHERE user_id = ? AND status_verifikasi = 'approved'";
    db.query(sqlCek, [user_id], (err, data) => {
        if (err) { console.error(err); return res.status(500).json("Error database"); }
        if (data.length === 0) return res.json({ status: "Fail", message: "Eits! Hanya penghuni resmi (Approved) yang boleh lapor." });

        const sqlInsert = "INSERT INTO complaints (user_id, judul_keluhan, isi_keluhan) VALUES (?, ?, ?)";
        db.query(sqlInsert, [user_id, judul, isi], (err, result) => {
            if(err) return res.status(500).json("Gagal kirim keluhan");
            return res.json({ status: "Success", message: "Laporan diterima" });
        });
    });
});

app.get('/api/complaints', (req, res) => {
    const sql = `
        SELECT c.*, u.nama_lengkap, r.nomor_kamar 
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN transactions t ON (t.user_id = u.id AND t.status_verifikasi = 'approved')
        LEFT JOIN rooms r ON t.room_id = r.id
        ORDER BY c.tanggal_lapor DESC
    `;
    db.query(sql, (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.put('/api/complaints/:id', (req, res) => {
    const { status } = req.body;
    const sql = "UPDATE complaints SET status = ? WHERE id = ?";
    db.query(sql, [status, req.params.id], (err, result) => {
        if(err) return res.status(500).json("Gagal update");
        return res.json({ status: "Success" });
    });
});

app.get('/api/expenses', (req, res) => {
    db.query("SELECT * FROM expenses ORDER BY tanggal_pengeluaran DESC", (err, data) => {
        if(err) return res.status(500).json(err);
        return res.json(data);
    });
});

app.post('/api/expenses', (req, res) => {
    const { nama, biaya, tanggal } = req.body;
    const sql = "INSERT INTO expenses (nama_pengeluaran, biaya, tanggal_pengeluaran) VALUES (?, ?, ?)";
    db.query(sql, [nama, biaya, tanggal], (err, result) => {
        if(err) return res.status(500).json("Gagal simpan");
        return res.json({ status: "Success" });
    });
});

// ==========================================
// API UNTUK MANAJEMEN KAMAR (CRUD ROOMS)
// ==========================================

// 1. GET - Ambil semua data kamar (Untuk tampil di tabel)
app.get('/api/rooms', (req, res) => {
    const sql = "SELECT * FROM rooms";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ error: "Gagal mengambil data kamar", detail: err });
        return res.json(result);
    });
});

// 2. POST - Tambah kamar baru
app.post('/api/rooms', (req, res) => {
    // Tambahin foto_kamar di sini
    const { nomor_kamar, tipe_kamar, harga_bulanan, fasilitas, status, foto_kamar } = req.body; 
    const sql = "INSERT INTO rooms (nomor_kamar, tipe_kamar, harga_bulanan, fasilitas, status, foto_kamar) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [nomor_kamar, tipe_kamar, harga_bulanan, fasilitas, status, foto_kamar], (err, result) => {
        if (err) return res.status(500).json({ error: "Gagal menambah kamar", detail: err });
        return res.json({ message: "Kamar berhasil ditambahkan!", id: result.insertId });
    });
});

// 5. PUT - Edit Tipe Kamar (Bulk Update Harga & Fasilitas)
app.put('/api/rooms/update-tipe', (req, res) => {
    // Kita print data yang dikirim dari React ke terminal backend
    console.log("Data yang diterima dari React:", req.body); 

    const { tipe_kamar_lama, tipe_kamar_baru, harga_bulanan, fasilitas } = req.body;
    
    const sql = "UPDATE rooms SET tipe_kamar=?, harga_bulanan=?, fasilitas=? WHERE tipe_kamar=?";
    
    db.query(sql, [tipe_kamar_baru, harga_bulanan, fasilitas, tipe_kamar_lama], (err, result) => {
        if (err) {
            console.log("Error Database:", err); // Print errornya kalau gagal
            return res.status(500).json({ error: "Gagal mengupdate tipe kamar", detail: err });
        }
        console.log("Sukses update! Jumlah kamar yang berubah:", result.affectedRows);
        return res.json({ message: "Semua kamar pada tipe ini berhasil diupdate!" });
    });
});

// 3. PUT - Edit Tipe Kamar (Bulk Update Harga, Fasilitas & Foto)
app.put('/api/rooms/update-tipe', (req, res) => {
    // Tambahin foto_kamar di sini
    const { tipe_kamar_lama, tipe_kamar_baru, harga_bulanan, fasilitas, foto_kamar } = req.body;
    const sql = "UPDATE rooms SET tipe_kamar=?, harga_bulanan=?, fasilitas=?, foto_kamar=? WHERE tipe_kamar=?";
    
    db.query(sql, [tipe_kamar_baru, harga_bulanan, fasilitas, foto_kamar, tipe_kamar_lama], (err, result) => {
        if (err) return res.status(500).json({ error: "Gagal mengupdate tipe kamar", detail: err });
        return res.json({ message: "Semua kamar pada tipe ini berhasil diupdate!" });
    });
});

// 4. DELETE - Hapus kamar
app.delete('/api/rooms/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM rooms WHERE id=?";
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ error: "Gagal menghapus kamar", detail: err });
        return res.json({ message: "Kamar berhasil dihapus!" });
    });
});



module.exports = app;