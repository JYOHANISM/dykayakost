import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, MessageCircle, MapPin, BedDouble, Wifi, AlertCircle, ShieldCheck, User } from 'lucide-react';

const RoomDetail = () => {
  const { tipe } = useParams();
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
  const dashboardLink = userRole === 'admin' ? '/admin' : '/user';
  
  const [roomData, setRoomData] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // State Form Booking
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({ nama: localStorage.getItem('userName') || '', no_hp: '', durasi: 1 });
  const [formError, setFormError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch data kamar, cari yang tipenya sesuai URL
    fetch('/api/rooms')
      .then(res => res.json())
      .then(data => {
        const availableRooms = data.filter(r => r.tipe_kamar === tipe && r.status === 'tersedia');
        if(availableRooms.length > 0) {
            setRoomData(availableRooms[0]); // Ambil 1 kamar yang tersedia
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tipe]);

  const handleBooking = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert("Silakan Login terlebih dahulu untuk memesan kamar!");
        navigate('/login');
        return;
    }
    if (!formData.nama || !formData.no_hp) {
        setFormError("Nama dan WhatsApp wajib diisi!");
        return;
    }

    try {
        const response = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nama: formData.nama,
                no_hp: formData.no_hp,
                room_id: roomData.id,
                tipe_kamar: roomData.tipe_kamar,
                user_id: userId,
                durasi: formData.durasi
            })
        });
        const result = await response.json();
        if(result.status === "Success") setShowSuccess(true);
        else setFormError("Gagal booking, coba lagi nanti.");
    } catch (err) { setFormError("Error server!"); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Memuat Data Kamar...</div>;
  if (!roomData) return <div className="min-h-screen flex flex-col items-center justify-center"><h2 className="text-2xl font-bold text-slate-800">Kamar Habis / Tidak Ditemukan</h2><button onClick={()=>navigate('/')} className="mt-4 text-blue-600 font-bold">Kembali ke Beranda</button></div>;

  const photos = roomData.foto_kamar ? roomData.foto_kamar.split(',').map(u => u.trim()) : [];
  const facilities = roomData.fasilitas ? roomData.fasilitas.split(',').map(f => f.trim()) : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* HEADER NAV */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 w-full">
        {/* Ditambahkan justify-between biar logo di kiri, menu di kanan */}
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
            
            {/* KIRI: LOGO DYKAYA SEBAGAI TOMBOL KEMBALI KE HOME */}
            <button onClick={() => navigate('/')} className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left outline-none">
                <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                    <img src="/logo-baru.png" alt="Logo Dykaya" className="w-full h-full object-contain" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">KOST<span className="text-blue-600">DYKAYA</span></h1>
                    <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Comfort Living Space</p>
                </div>
            </button>

            {/* KANAN: MENU SEPERTI DI HALAMAN UTAMA */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
                {/* Link ditambahkan garis miring "/" biar kembali ke halaman utama dulu */}
                
                {currentUser ? (
                    <button onClick={() => navigate(dashboardLink)} className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition ml-2">
                        <User size={18} /> Halo, {currentUser.split(' ')[0]}
                    </button>
                ) : (
                    <button onClick={() => navigate('/login')} className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 ml-2">
                        Login Penghuni
                    </button>
                )}
            </div>

        </div>
      </nav>

      <div className="max-w-4xl mx-auto mt-6 px-4">
        {/* GALERI FOTO */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-6">
            <div className="h-64 md:h-96 w-full rounded-2xl overflow-hidden mb-4">
                <img src={photos[activePhoto] || photos[0]} className="w-full h-full object-cover" alt="Kamar" />
            </div>
            {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {photos.map((url, idx) => (
                        <button key={idx} onClick={() => setActivePhoto(idx)} className={`w-20 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition ${activePhoto === idx ? 'border-blue-600' : 'border-transparent opacity-60'}`}>
                            <img src={url} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SPESIFIKASI KIRI */}
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">Tersedia (Kamar {roomData.nomor_kamar})</span>
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{roomData.tipe_kamar}</h2>
                    <p className="text-slate-500 flex items-center gap-2"><MapPin size={16}/> Jl. Taman Bunga Merak II No. 62, Lowokwaru, Malang</p>
                    
                    <hr className="my-6 border-slate-100" />
                    
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><BedDouble className="text-blue-600"/> Fasilitas Kamar</h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {facilities.map((f, i) => <div key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700"><CheckCircle size={16} className="text-emerald-500"/> {f}</div>)}
                    </div>

                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ShieldCheck className="text-amber-600"/> Peraturan Kost</h3>
                    <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                        <li>Dilarang membawa hewan peliharaan.</li>
                        <li>Akses gerbang 24 Jam (Membawa kunci masing-masing).</li>
                        <li>Tamu lawan jenis dilarang masuk ke dalam kamar.</li>
                        <li>Dilarang merokok di dalam kamar (Tersedia area khusus).</li>
                    </ul>
                </div>
            </div>

            {/* HARGA KANAN */}
            <div className="md:col-span-1">
                <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 sticky top-24">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Harga Sewa</p>
                    <div className="text-3xl font-black text-blue-600 mb-6">Rp {parseInt(roomData.harga_bulanan).toLocaleString('id-ID')} <span className="text-sm text-slate-500 font-medium">/Bulan</span></div>

                    {!showBookingForm ? (
                        <div className="space-y-3">
                            <button onClick={() => setShowBookingForm(true)} className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg">Pesan Kamar Ini</button>
                            <a href={`https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20tertarik%20dengan%20kamar%20tipe%20${roomData.tipe_kamar}.%20Bisa%20tanya-tanya%20dulu?`} target="_blank" className="w-full py-3.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 transition flex justify-center items-center gap-2"><MessageCircle size={18}/> Tanya Admin</a>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-slate-800">Form Pemesanan</h4>
                                <button onClick={()=>setShowBookingForm(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">Batal</button>
                            </div>
                            {formError && <p className="text-xs text-rose-600 font-bold flex items-center gap-1"><AlertCircle size={14}/> {formError}</p>}
                            <input type="text" placeholder="Nama Lengkap" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.nama} onChange={e=>setFormData({...formData, nama: e.target.value})} />
                            <input type="number" placeholder="No. WhatsApp" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.no_hp} onChange={e=>setFormData({...formData, no_hp: e.target.value})} />
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none" value={formData.durasi} onChange={e=>setFormData({...formData, durasi: parseInt(e.target.value)})}>
                                {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1} Bulan</option>)}
                            </select>
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 mt-2">
                                <p className="text-xs text-blue-600 font-bold mb-1">Total Tagihan:</p>
                                <p className="text-xl font-black text-blue-800">Rp {(parseInt(roomData.harga_bulanan) * formData.durasi).toLocaleString('id-ID')}</p>
                            </div>
                            <button onClick={handleBooking} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition mt-2">Konfirmasi Booking</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center animate-fade-in">
                <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Booking Berhasil!</h3>
                <p className="text-slate-500 mb-6 text-sm">Tagihan sudah masuk ke akun Anda. Silakan selesaikan pembayaran.</p>
                <button onClick={() => navigate('/user')} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl">Ke Dashboard Penghuni</button>
            </div>
        </div>
      )}
    </div>
  );
};
export default RoomDetail;