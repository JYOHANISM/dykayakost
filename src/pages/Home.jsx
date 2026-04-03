import React, { useState, useEffect } from 'react';
import { MapPin, Star, Zap, Phone, Wifi, Car, Utensils, ShieldCheck, Menu, X, User, BedDouble, Lock, CheckCircle, AlertCircle, ArrowRight, XCircle } from 'lucide-react';
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
    if (savedName) { setCurrentUser(savedName); setUserRole(savedRole); }

    fetch('/api/rooms')
      .then((res) => res.json())
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
      .catch((error) => console.error("Error:", error));
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
    if(!formData.nama || !formData.no_hp) { setFormError("Wajib diisi semua ya bro!"); return; }
    const loggedInUserId = localStorage.getItem('userId');
    try {
        const response = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nama: formData.nama, no_hp: formData.no_hp,
                room_id: bookingTargetId, tipe_kamar: selectedType.tipe_kamar,
                user_id: loggedInUserId
            })
        });
        const result = await response.json();
        if(result.status === "Success") {
            setIsModalOpen(false); setShowSuccessModal(true); 
            setFormData({ nama: '', no_hp: '' });
        }
    } catch (error) { setFormError("Server error!"); }
  };

  const dashboardLink = userRole === 'admin' ? '/admin' : '/user';

  return (
    <div className="min-h-screen bg-[#f3f3f3] font-sans text-[#1a1a1a] scroll-smooth selection:bg-yellow-300 selection:text-black uppercase tracking-tight">
      
      {/* 1. MARQUEE TOP BAR */}
      <div className="bg-black text-white py-3 overflow-hidden border-b-4 border-black fixed w-full top-0 z-[60]">
        <div className="whitespace-nowrap animate-marquee flex gap-12 font-black text-[11px] tracking-[0.3em]">
          <span>⭐️ DYKAYA KOST MALANG</span>
          <span>• PREMIUM LIVING SPACE</span>
          <span>• HARGA MAHASISWA FASILITAS HOTEL</span>
          <span>• FREE WIFI 100MBPS</span>
          <span>• CCTV 24 JAM</span>
          <span>• LOKASI STRATEGIS LOWOKWARU</span>
          <span>• SISA {rawRooms.filter(r => r.status === 'tersedia').length} UNIT LAGI</span>
          <span>⭐️ DYKAYA KOST MALANG</span>
        </div>
      </div>

      {/* 2. NAVBAR: Neo-Brutalist Style */}
      <nav className="fixed w-full z-50 top-14 px-6">
        <div className="max-w-6xl mx-auto bg-white border-4 border-black p-4 flex items-center justify-between shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">DYKAYA<span className="text-blue-600">.</span></h1>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-widest">
            <a href="#katalog" className="hover:text-blue-600 transition-colors">Availability</a>
            <a href="#fasilitas" className="hover:text-blue-600 transition-colors">Amenities</a>
            {currentUser ? (
                <a href={dashboardLink} className="bg-yellow-300 border-2 border-black px-5 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                  DASHBOARD: {currentUser}
                </a>
            ) : (
                <a href="/login" className="bg-blue-600 text-white border-2 border-black px-6 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-black transition-all">Login</a>
            )}
          </div>
          <button className="md:hidden p-2 border-2 border-black" onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu size={24} /></button>
        </div>
      </nav>

      {/* 3. HERO: Asymmetric Layout */}
      <header className="pt-48 pb-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Title Box */}
          <div className="lg:col-span-8 bg-white border-4 border-black p-10 shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 border-b-4 border-l-4 border-black flex items-center justify-center -mr-8 -mt-8 rotate-12">
               <Zap size={40} strokeWidth={3} className="mt-4 mr-4" />
            </div>
            <p className="text-blue-600 font-black text-xs mb-4 tracking-[0.3em]">RESIDENCE & CO-LIVING</p>
            <h2 className="text-6xl md:text-[100px] font-black leading-[0.85] uppercase mb-10">
              Living <br/> Without <br/> <span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>Limits.</span>
            </h2>
            <div className="flex flex-wrap gap-4">
              <a href="#katalog" className="bg-black text-white px-10 py-5 font-black text-xl shadow-[6px_6px_0px_0px_rgba(253,224,71,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase">
                Find My Room
              </a>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="lg:col-span-4 grid grid-cols-1 gap-6">
            <div className="bg-emerald-400 border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-end min-h-[200px]">
               <h3 className="text-5xl font-black italic">100%</h3>
               <p className="font-bold text-xs">MAHASISWA APPROVED</p>
            </div>
            <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 group hover:bg-blue-600 hover:text-white transition-all">
               <MapPin size={32} strokeWidth={3} />
               <div>
                  <p className="text-[10px] font-black text-slate-400 group-hover:text-white/70">MALANG CITY</p>
                  <p className="text-lg font-black leading-none">LOWOKWARU</p>
               </div>
            </div>
          </div>

        </div>
      </header>

      {/* 4. AMENITIES: Sharp Box Grid */}
      <section id="fasilitas" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 border-4 border-black bg-black gap-1 shadow-[10px_10px_0px_0px_rgba(16,185,129,1)]">
            {[
              { icon: Wifi, label: "FIBER WIFI", color: "bg-white" },
              { icon: ShieldCheck, label: "SECURE 24/7", color: "bg-yellow-300" },
              { icon: Utensils, label: "BIG KITCHEN", color: "bg-emerald-400" },
              { icon: Car, label: "FREE PARKING", color: "bg-white" }
            ].map((f, i) => (
              <div key={i} className={`${f.color} p-12 flex flex-col items-center justify-center gap-4 hover:invert transition-all cursor-default`}>
                <f.icon size={48} strokeWidth={3} />
                <span className="font-black text-xs tracking-widest">{f.label}</span>
              </div>
            ))}
        </div>
      </section>

      {/* 5. KATALOG: Brutalist Cards */}
      <section id="katalog" className="max-w-6xl mx-auto px-6 py-32">
        <div className="flex items-center gap-6 mb-20">
          <h3 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">Availability</h3>
          <div className="h-2 flex-1 bg-black"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {displayTypes.map((type, index) => (
            <div key={index} className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col group hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all duration-300">
              <div className="h-72 border-b-4 border-black overflow-hidden relative">
                <img src={type.foto_kamar} alt={type.tipe_kamar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-white border-2 border-black px-4 py-2 font-black text-[12px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                   {type.stokTersedia > 0 ? `${type.stokTersedia} UNITS LEFT` : 'FULL BOOKED'}
                </div>
              </div>
              <div className="p-8 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-3xl font-black mb-4 uppercase tracking-tighter">{type.tipe_kamar}</h4>
                  <div className="flex flex-wrap gap-2 mb-10">
                    {type.fasilitas.split(',').map((feat, idx) => (
                      <span key={idx} className="text-[10px] font-black uppercase px-2 py-1 border-2 border-black bg-[#f0f0f0]">{feat.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 pt-6 border-t-2 border-black">
                  <div className="flex justify-between items-center font-black">
                    <span className="text-xs text-slate-400">PRICE/MONTH</span>
                    <span className="text-2xl text-blue-600">Rp {parseInt(type.harga_bulanan).toLocaleString('id-ID')}</span>
                  </div>
                  <button 
                    onClick={() => type.stokTersedia > 0 && openBooking(type)} 
                    disabled={type.stokTersedia === 0} 
                    className="w-full bg-black text-white font-black py-5 uppercase tracking-[0.2em] text-sm hover:bg-blue-600 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-300"
                  >
                    {type.stokTersedia > 0 ? 'Select This Unit' : 'Sold Out'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FOOTER: High Contrast */}
      <footer id="lokasi" className="bg-white border-t-4 border-black py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20">
            <div>
                <h2 className="text-6xl font-black italic mb-10 tracking-tighter uppercase underline decoration-yellow-300 decoration-8 underline-offset-4">DYKAYA MALANG</h2>
                <div className="space-y-6 text-xl font-bold uppercase">
                    <p className="flex items-start gap-4"> <MapPin strokeWidth={3} className="mt-1" /> Jl. Taman Bunga Merak II No. 62, Malang</p>
                    <p className="flex items-center gap-4 text-blue-600"> <Phone strokeWidth={3} /> +62 812 3456 7890</p>
                </div>
            </div>
            <div className="border-4 border-black shadow-[15px_15px_0px_0px_rgba(59,130,246,1)] h-80 overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000">
                <iframe title="map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15805.992641040854!2d112.6174061!3d-7.9473849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e78827687d272d7%3A0x1042701c9f4d1e2!2sLowokwaru%2C%20Malang%20City%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1712160000000!5m2!1sen!2sid" width="100%" height="100%" style={{border:0}}></iframe>
            </div>
        </div>
        <div className="mt-20 pt-10 border-t-2 border-black text-center font-black text-[10px] tracking-[0.5em] text-slate-300 italic px-6">
            © 2026 DYKAYA KOST MANAGEMENT • ALL RIGHTS RESERVED
        </div>
      </footer>

      {/* 7. MODALS: Neo-Brutalist Popups */}
      {isModalOpen && selectedType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-blue-600/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg relative z-10 p-10 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
                  <h3 className="text-4xl font-black italic uppercase tracking-tighter">CHECK-IN</h3>
                  <button onClick={() => setIsModalOpen(false)}><X size={32} strokeWidth={3} /></button>
                </div>
                <div className="space-y-6">
                    {formError && <div className="bg-rose-500 text-white p-4 border-4 border-black font-black uppercase text-[10px]">{formError}</div>}
                    <div>
                        <label className="text-[10px] font-black uppercase mb-2 block tracking-widest">GUEST NAME</label>
                        <input type="text" className="w-full border-4 border-black p-4 text-xl font-bold outline-none focus:bg-yellow-50" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase mb-2 block tracking-widest">WHATSAPP NUMBER</label>
                        <input type="tel" className="w-full border-4 border-black p-4 text-xl font-bold outline-none focus:bg-yellow-50" placeholder="08XXXXXXXXXX" value={formData.no_hp} onChange={(e) => setFormData({...formData, no_hp: e.target.value})} />
                    </div>
                    <button onClick={handleSubmitBooking} className="w-full bg-blue-600 text-white font-black py-6 text-xl uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">CONFIRM BOOKING</button>
                </div>
            </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90" onClick={() => setShowLoginModal(false)}></div>
            <div className="bg-white border-4 border-black shadow-[15px_15px_0px_0px_rgba(37,99,235,1)] w-full max-w-sm relative z-10 p-12 text-center">
                <Lock size={60} strokeWidth={3} className="mx-auto mb-6 text-blue-600" />
                <h3 className="text-3xl font-black italic uppercase mb-2 tracking-tighter">DITOLAK!</h3>
                <p className="font-bold text-slate-500 mb-8 text-sm italic">LU HARUS LOGIN DULU BRO SEBELUM BOOKING.</p>
                <div className="flex flex-col gap-3">
                    <button onClick={() => navigate('/login')} className="w-full bg-black text-white font-black py-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] uppercase tracking-widest text-xs">Login Bro</button>
                    <button onClick={() => setShowLoginModal(false)} className="font-black text-[10px] uppercase tracking-widest mt-4">Nanti Aja</button>
                </div>
            </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-md"></div>
            <div className="bg-white border-4 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] p-12 text-center max-w-sm relative z-10">
                <CheckCircle size={60} strokeWidth={3} className="mx-auto mb-6 text-emerald-500" />
                <h3 className="text-4xl font-black uppercase mb-4 tracking-tighter">DONE!</h3>
                <p className="font-bold mb-10 italic">BOOKING MASUK. TUNGGUIN WA DARI KITA YA!</p>
                <button onClick={() => window.location.reload()} className="w-full bg-black text-white py-5 font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]">MANTAP!</button>
            </div>
        </div>
      )}

      {/* MARQUEE KEYFRAMES */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
      `}</style>

    </div>
  );
};

export default Home;