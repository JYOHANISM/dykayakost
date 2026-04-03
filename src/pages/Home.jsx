import React, { useState, useEffect } from 'react';
import { MapPin, Star, XCircle, Zap, Phone, Wifi, Car, Utensils, ShieldCheck, Menu, X, User, BedDouble, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [rawRooms, setRawRooms] = useState([]); 
  const [displayTypes, setDisplayTypes] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null); 
  const [bookingTargetId, setBookingTargetId] = useState(null); 
  const [formData, setFormData] = useState({ nama: '', no_hp: '' });
  const [formError, setFormError] = useState(''); 
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const savedName = localStorage.getItem('userName');
    const savedRole = localStorage.getItem('userRole');
    if (savedName) {
        setCurrentUser(savedName);
        setUserRole(savedRole);
    }

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

  const openBooking = (typeData) => {
    const isLoggedIn = localStorage.getItem('userId');
    if (!isLoggedIn) { setShowLoginModal(true); return; }
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
    } catch (error) { setFormError("Error koneksi ke server!"); }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    window.location.reload(); 
  };

  const dashboardLink = userRole === 'admin' ? '/admin' : '/user';

  return (
    <div className="min-h-screen bg-[#FDFDFF] font-sans text-slate-900 scroll-smooth">
      {/* NAVBAR MODERN */}
      <nav className="fixed w-full z-50 top-0 left-0 px-6 py-4">
        <div className="max-w-6xl mx-auto bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl px-6 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black italic tracking-tighter">DYKAYA<span className="text-blue-600">.</span></h1>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[13px] font-bold uppercase tracking-wider">
            <a href="#" className="hover:text-blue-600 transition-colors">Beranda</a>
            <a href="#katalog" className="hover:text-blue-600 transition-colors">Katalog</a>
            <a href="#lokasi" className="hover:text-blue-600 transition-colors">Kontak</a>
            {currentUser ? (
                <a href={dashboardLink} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-2xl hover:bg-blue-700 transition">
                  Halo, {currentUser}
                </a>
            ) : (
                <a href="/login" className="text-slate-900 hover:text-blue-600 transition">Login</a>
            )}
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>{isMenuOpen ? <X /> : <Menu />}</button>
        </div>
      </nav>

      {/* HERO DENGAN GAYA BRUTALIST HALUS */}
      <header className="pt-32 pb-20 px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Premium Living</div>
          <h2 className="text-5xl md:text-7xl font-black mb-6 leading-[0.9] tracking-tighter">
            KOST KEREN <br/> UNTUK <span className="text-blue-600 underline decoration-4 underline-offset-8">MADA DEPAN</span>
          </h2>
          <p className="text-lg text-slate-500 mb-10 max-w-md font-medium">Lupakan kost lama yang sumpek. Di Dykaya, kita buat hidup kamu jadi lebih mudah, estetik, dan nyaman.</p>
          <div className="flex flex-wrap gap-4">
            <a href="#katalog" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-600 transition flex items-center gap-2 group">
              Cek Kamar <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </a>
          </div>
        </div>
        <div className="lg:col-span-5 relative">
          <div className="w-full aspect-square bg-blue-600 rounded-[3rem] rotate-3 absolute inset-0 -z-10"></div>
          <div className="w-full aspect-square bg-slate-200 rounded-[3rem] overflow-hidden shadow-2xl relative border-4 border-white">
             <img src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80" className="w-full h-full object-cover" alt="Hero" />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 hidden md:block">
             <div className="flex gap-1 text-amber-400 mb-2"><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/></div>
             <p className="text-xs font-bold text-slate-400 uppercase">Rating Tertinggi di Malang</p>
          </div>
        </div>
      </header>

      {/* FASILITAS MINIMALIS */}
      <section className="bg-slate-900 py-20 overflow-hidden text-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { icon: Wifi, label: "Super Wifi", desc: "100Mbps" },
              { icon: ShieldCheck, label: "Aman", desc: "CCTV 24/7" },
              { icon: Utensils, label: "Dapur", desc: "Alat Lengkap" },
              { icon: Car, label: "Parkir", desc: "Luas & Rapi" }
            ].map((f, i) => (
              <div key={i} className="text-center md:text-left">
                <f.icon className="text-blue-500 mb-4 mx-auto md:mx-0" size={32} />
                <h4 className="font-black text-xl mb-1 italic">{f.label}</h4>
                <p className="text-slate-400 text-sm font-medium">{f.desc}</p>
              </div>
            ))}
        </div>
      </section>

      {/* KATALOG UNIK */}
      <section id="katalog" className="max-w-6xl mx-auto px-6 py-24">
        <div className="mb-16">
          <h3 className="text-4xl font-black tracking-tighter mb-2 italic">READY STOCK.</h3>
          <p className="text-slate-500 font-medium">Hanya sisa {rawRooms.filter(r => r.status === 'tersedia').length} unit lagi, jangan sampai telat.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {displayTypes.map((type, index) => (
            <div key={index} className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden hover:border-blue-600 transition-all duration-500 group">
              <div className="h-72 overflow-hidden relative">
                <img src={type.foto_kamar} alt={type.tipe_kamar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-6 left-6">
                  <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl border-2 border-white ${type.stokTersedia > 0 ? 'bg-blue-600 text-white' : 'bg-rose-500 text-white'}`}>
                    {type.stokTersedia > 0 ? `${type.stokTersedia} Available` : 'Sold Out'}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-black mb-4 italic uppercase tracking-tighter">{type.tipe_kamar}</h4>
                <div className="flex flex-wrap gap-2 mb-8">
                  {type.fasilitas.split(',').slice(0,3).map((feat, idx) => (
                    <span key={idx} className="text-[9px] font-black uppercase px-3 py-1 bg-slate-100 rounded-full text-slate-500">{feat}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Per Bulan</p>
                    <p className="text-xl font-black text-blue-600">Rp {parseInt(type.harga_bulanan).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => type.stokTersedia > 0 && openBooking(type)} 
                    disabled={type.stokTersedia === 0} 
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${type.stokTersedia > 0 ? 'bg-slate-900 text-white hover:bg-blue-600' : 'bg-slate-100 text-slate-300'}`}
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer id="lokasi" className="bg-white border-t border-slate-100 py-20">
        <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                <div>
                    <h2 className="text-3xl font-black italic mb-8">KOST DYKAYA<span className="text-blue-600">.</span></h2>
                    <div className="space-y-6 text-slate-500 font-medium">
                        <div className="flex items-center gap-4 hover:text-blue-600 transition-colors">
                            <MapPin className="text-slate-300" size={20} /> 
                            <span>Taman Bunga Merak II No.62, Malang</span>
                        </div>
                        <div className="flex items-center gap-4 hover:text-blue-600 transition-colors">
                            <Phone className="text-slate-300" size={20} /> 
                            <span>0812-3456-7890</span>
                        </div>
                    </div>
                </div>
                <div className="rounded-[2.5rem] overflow-hidden h-64 border-8 border-slate-50 grayscale hover:grayscale-0 transition-all duration-700">
                    <iframe title="Lokasi" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15805.992641040854!2d112.6174061!3d-7.9473849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e78827687d272d7%3A0x1042701c9f4d1e2!2sLowokwaru%2C%20Malang%20City%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1712160000000!5m2!1sen!2sid" width="100%" height="100%" style={{border:0}} loading="lazy"></iframe>
                </div>
            </div>
            <div className="mt-20 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 text-center italic">© 2026 DYKAYA KOST MANAGEMENT.</div>
        </div>
      </footer>

      {/* MODALS - Tetap fungsional tapi gaya disesuaikan */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90" onClick={() => setShowLoginModal(false)}></div>
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] relative z-10 p-10 text-center">
                <Lock size={40} className="mx-auto mb-6 text-blue-600" />
                <h3 className="text-2xl font-black italic mb-2 uppercase tracking-tighter">STOP!</h3>
                <p className="text-slate-400 font-medium mb-8 text-sm">Harus login dulu baru bisa booking kamar ini.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => navigate('/login')} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition uppercase tracking-widest text-xs">Login Sekarang</button>
                    <button onClick={() => setShowLoginModal(false)} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest">Nanti Dulu</button>
                </div>
            </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-blue-600/95"></div>
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] relative z-10 p-10 text-center shadow-2xl">
                <CheckCircle size={40} className="mx-auto mb-6 text-emerald-500" />
                <h3 className="text-2xl font-black italic mb-2 tracking-tighter uppercase">BOOM! BERHASIL.</h3>
                <p className="text-slate-500 font-medium mb-8 text-sm">Admin kita bakal segera WA kamu. Siap-siap ya!</p>
                <button onClick={handleCloseSuccess} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition uppercase tracking-widest text-xs">MANTAP!</button>
            </div>
        </div>
      )}

      {isModalOpen && selectedType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] relative z-10 overflow-hidden shadow-2xl">
                <div className="p-10">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">PILIH {selectedType.tipe_kamar}</h3>
                    <p className="text-sm text-blue-600 font-bold mb-8 uppercase tracking-[0.2em]">Konfirmasi Identitas</p>
                    <div className="space-y-6">
                        {formError && <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl text-[10px] font-black uppercase border-2 border-rose-100">{formError}</div>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
                                <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-blue-600 outline-none transition" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">No. WhatsApp</label>
                                <input type="tel" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold focus:border-blue-600 outline-none transition" placeholder="08xx-xxxx" value={formData.no_hp} onChange={(e) => setFormData({...formData, no_hp: e.target.value})} />
                            </div>
                        </div>
                        <button onClick={handleSubmitBooking} className="w-full bg-blue-600 hover:bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-xl transition-all uppercase tracking-[0.2em] text-xs">Gas Booking!</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;