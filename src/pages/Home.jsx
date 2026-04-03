import React, { useState, useEffect } from 'react';
import { MapPin, Star, XCircle, ChevronRight, Zap, Phone, Wifi, Car, Utensils, ShieldCheck, Menu, X, User, BedDouble, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [rawRooms, setRawRooms] = useState([]); 
  const [displayTypes, setDisplayTypes] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // STATE POP-UP
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // STATE FORM & ERROR
  const [selectedType, setSelectedType] = useState(null); 
  const [bookingTargetId, setBookingTargetId] = useState(null); 
  const [formData, setFormData] = useState({ nama: '', no_hp: '' });
  const [formError, setFormError] = useState(''); 
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // --- FETCH DATA (URL RELATIF UNTUK VERCEL) ---
  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    const savedRole = localStorage.getItem('userRole');
    if (savedName) {
        setCurrentUser(savedName);
        setUserRole(savedRole);
    }

    // Ganti localhost jadi /api
    fetch('/api/rooms')
      .then((response) => response.json())
      .then((data) => {
        setRawRooms(data); 
        const grouped = {};
        data.forEach(room => {
            if (!grouped[room.tipe_kamar]) {
                grouped[room.tipe_kamar] = { ...room, totalStok: 0, stokTersedia: 0, nextAvailableId: null };
            }
            grouped[room.tipe_kamar].totalStok++;
            if (room.status === 'tersedia') {
                grouped[room.tipe_kamar].stokTersedia++;
                if (!grouped[room.tipe_kamar].nextAvailableId) grouped[room.tipe_kamar].nextAvailableId = room.id;
            }
        });
        setDisplayTypes(Object.values(grouped));
      })
      .catch((error) => console.error("Gagal ambil data:", error));
  }, []);

  // --- HANDLERS ---
  const openBooking = (typeData) => {
    const isLoggedIn = localStorage.getItem('userId');
    
    if (!isLoggedIn) {
        setShowLoginModal(true); 
        return; 
    }

    setSelectedType(typeData);
    setBookingTargetId(typeData.nextAvailableId);
    setFormError(''); 
    
    const savedName = localStorage.getItem('userName');
    setFormData({ nama: savedName || '', no_hp: '' });
    setIsModalOpen(true);
  };

  const handleSubmitBooking = async () => {
    if(!formData.nama || !formData.no_hp) {
        setFormError("Nama dan Nomor WhatsApp wajib diisi!");
        return;
    }

    const loggedInUserId = localStorage.getItem('userId');

    try {
        // Ganti localhost jadi /api
        const response = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nama: formData.nama,
                no_hp: formData.no_hp,
                room_id: bookingTargetId, 
                tipe_kamar: selectedType.tipe_kamar,
                user_id: loggedInUserId
            })
        });
        const result = await response.json();
        
        if(result.status === "Success") {
            setIsModalOpen(false);
            setShowSuccessModal(true); 
            setFormData({ nama: '', no_hp: '' });
        } else {
            setFormError("Gagal booking, coba lagi nanti.");
        }
    } catch (error) { 
        setFormError("Error koneksi ke server!"); 
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    window.location.reload(); 
  };

  const dashboardLink = userRole === 'admin' ? '/admin' : '/user';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 scroll-smooth">
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 fixed w-full z-40 top-0 left-0">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="#" className="flex items-center gap-3" onClick={() => window.scrollTo(0,0)}>
                {/* --- BAGIAN YANG DIGANTI: LOGO ICON --- */}
                {/* Menghapus div bg-blue-600 lama, diganti div pembungkus gambar */}
                <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                    {/* Pastikan file 'logo-baru.png' ada di folder 'public' */}
                    <img src="/logo-baru.png" alt="Logo Dykaya Baru" className="w-full h-full object-contain" />
                </div>
                {/* --- AKHIR BAGIAN YANG DIGANTI --- */}

                {/* TEXT TETAP SAMA, TIDAK DIGANTI */}
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">KOST<span className="text-blue-600">DYKAYA</span></h1>
                    <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Comfort Living Space</p>
                </div>
            </a>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-blue-600">Beranda</a>
            <a href="#fasilitas" className="hover:text-blue-600">Fasilitas</a>
            <a href="#katalog" className="hover:text-blue-600">Katalog</a>
            <a href="#lokasi" className="hover:text-blue-600">Lokasi</a>
            {currentUser ? (
                <a href={dashboardLink} className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition"><User size={18} /> Halo, {currentUser}</a>
            ) : (
                <a href="/login" className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">Login Penghuni</a>
            )}
          </div>
          <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="pt-32 pb-10 px-6 max-w-6xl mx-auto">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-30 -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wide mb-6">PROMO: MAAF LAGI GAADA</span>
            <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">Hunian Nyaman<br/> <span className="text-blue-400">Buat Kamu di Malang</span></h2>
            <div className="flex flex-col md:flex-row md:items-center gap-2 text-blue-200 mb-8 font-medium bg-slate-800/50 w-fit px-4 py-2 rounded-lg border border-slate-700"><MapPin size={20} /> <span>Jl. Taman Bunga Merak II No. 62, Lowokwaru</span></div>
            <a href="#katalog" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl md:rounded-full font-bold transition inline-block">Cari Kamar</a>
          </div>
        </div>
      </header>

      {/* FASILITAS */}
      <section id="fasilitas" className="max-w-6xl mx-auto px-6 py-10 scroll-mt-24">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Fasilitas Unggulan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"><div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Wifi size={24} /></div><div><h4 className="font-bold text-slate-800">Free WiFi</h4><p className="text-xs text-slate-500">Fiber Cepat</p></div></div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"><div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Utensils size={24} /></div><div><h4 className="font-bold text-slate-800">Dapur</h4><p className="text-xs text-slate-500">Lengkap</p></div></div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"><div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Car size={24} /></div><div><h4 className="font-bold text-slate-800">Parkir</h4><p className="text-xs text-slate-500">Luas & Aman</p></div></div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"><div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><ShieldCheck size={24} /></div><div><h4 className="font-bold text-slate-800">CCTV</h4><p className="text-xs text-slate-500">24 Jam</p></div></div>
        </div>
      </section>

      {/* KATALOG */}
      <section id="katalog" className="max-w-6xl mx-auto px-6 pb-20 scroll-mt-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div><h3 className="text-2xl font-bold text-slate-900">Pilihan Tipe Kamar</h3><p className="text-slate-500 mt-2">Tersedia {rawRooms.filter(r => r.status === 'tersedia').length} unit kamar kosong hari ini.</p></div>
        </div>
        {displayTypes.length === 0 ? <div className="text-center py-20 text-slate-400">Loading data kamar...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayTypes.map((type, index) => (
              <div key={index} className="group bg-white rounded-3xl p-3 border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition duration-300 relative">
                <div className="relative h-64 rounded-2xl overflow-hidden mb-5">
                  <img src={type.foto_kamar} alt={type.tipe_kamar} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                  <div className="absolute top-4 left-4"><span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-lg ${type.stokTersedia > 0 ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'}`}>{type.stokTersedia > 0 ? `Tersedia (${type.stokTersedia} Unit)` : 'HABIS TERJUAL'}</span></div>
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-slate-900 font-bold shadow-lg">Rp {parseInt(type.harga_bulanan).toLocaleString('id-ID')} / bln</div>
                </div>
                <div className="px-2 pb-2">
                  <h4 className="text-xl font-bold text-slate-900 mb-2">{type.tipe_kamar}</h4>
                  <div className="flex flex-wrap gap-2 mb-6"><span className="text-[10px] font-medium px-2 py-1 rounded bg-blue-50 text-blue-600 flex items-center gap-1"><BedDouble size={12}/> Total {type.totalStok} Kamar</span>{type.fasilitas.split(',').map((feat, idx) => (<span key={idx} className="text-[10px] font-medium px-2 py-1 rounded bg-slate-100 text-slate-600">{feat}</span>))}</div>
                  <button onClick={() => type.stokTersedia > 0 && openBooking(type)} disabled={type.stokTersedia === 0} className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${type.stokTersedia > 0 ? 'bg-slate-900 text-white hover:bg-blue-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>{type.stokTersedia > 0 ? 'Pilih Kamar Ini' : 'Stok Habis'}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer id="lokasi" className="bg-slate-900 text-white py-16 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-2xl font-bold mb-6">KOST <span className="text-blue-500">DYKAYA</span></h2>
                    <p className="text-slate-400 mb-8 leading-relaxed max-w-md">Tempat Tinggal Nyaman Buat Kamu di Malang</p>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 hover:text-blue-400 transition-colors">
                            <MapPin className="text-blue-400 flex-shrink-0" /> 
                            <span>Jl. Taman Bunga Merak II No.62, Lowokwaru, Malang</span>
                        </div>
                        <div className="flex items-start gap-4 hover:text-blue-400 transition-colors">
                            <Phone className="text-blue-400 flex-shrink-0" /> 
                            <span>0812-3456-7890 (Ibu Kost)</span>
                        </div>
                    </div>
                </div>
                <div className="h-64 bg-slate-800 rounded-3xl overflow-hidden border-4 border-slate-700">
                    <iframe title="Lokasi" src="https://maps.google.com/maps?q=Malang&t=&z=13&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{border:0}} loading="lazy"></iframe>
                </div>
            </div>
            <div className="border-t border-slate-800 mt-16 pt-8 text-center text-slate-500 text-sm">© 2026 Kost Dykaya Malang. All Rights Reserved.</div>
        </div>
      </footer>

      {/* POP-UPS */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLoginModal(false)}></div>
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative z-10 p-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Lock size={32} /></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Akses Terbatas</h3>
                <p className="text-slate-500 mb-8 text-sm">Silakan Login terlebih dahulu untuk memesan kamar.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => navigate('/login')} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition">Login Sekarang</button>
                    <button onClick={() => setShowLoginModal(false)} className="w-full text-slate-500 font-bold py-3.5 rounded-xl">Nanti Dulu</button>
                </div>
            </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative z-10 p-8 text-center animate-fade-in">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={32} /></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Booking Berhasil!</h3>
                <p className="text-slate-500 mb-8 text-sm">Admin akan segera menghubungi via WhatsApp untuk konfirmasi.</p>
                <button onClick={handleCloseSuccess} className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition">OK, Siap!</button>
            </div>
        </div>
      )}

      {isModalOpen && selectedType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-fade-in">
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Booking {selectedType.tipe_kamar}</h3>
                        <p className="text-sm text-green-600 font-medium">Sistem memilihkan unit terbaik untukmu.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition"><XCircle className="text-slate-400 w-6 h-6" /></button>
                </div>
                <div className="p-8 space-y-4">
                    {formError && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl flex items-center gap-2 text-sm font-bold">
                            <AlertCircle size={16} /> {formError}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nama Lengkap</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">No. WhatsApp</label>
                            <input type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="08xx-xxxx" value={formData.no_hp} onChange={(e) => setFormData({...formData, no_hp: e.target.value})} />
                        </div>
                    </div>
                    <button type="button" onClick={handleSubmitBooking} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition">Booking Sekarang</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;