import React, { useState, useEffect } from 'react';
import { MapPin, Star, Zap, Phone, Wifi, Car, Utensils, ShieldCheck, Menu, X, User, BedDouble, Lock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
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
    if(!formData.nama || !formData.no_hp) { setFormError("Isi semua bro!"); return; }
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
    <div className="min-h-screen bg-[#f0f0f0] font-sans text-[#1a1a1a] scroll-smooth selection:bg-yellow-300">
      
      {/* NAVBAR: Gaya Floating Sharp */}
      <nav className="fixed w-full z-50 top-6 px-6">
        <div className="max-w-5xl mx-auto bg-white border-[3px] border-black px-6 h-16 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-xl font-black italic tracking-tighter uppercase">Dykaya<span className="text-blue-600">.</span></h1>
          
          <div className="hidden md:flex items-center gap-6 text-xs font-black uppercase tracking-widest">
            <a href="#katalog" className="hover:text-blue-600 transition-colors">Katalog</a>
            <a href="#fasilitas" className="hover:text-blue-600 transition-colors">Fasilitas</a>
            {currentUser ? (
                <a href={dashboardLink} className="bg-yellow-300 border-2 border-black px-4 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                  Akun: {currentUser}
                </a>
            ) : (
                <a href="/login" className="bg-blue-600 text-white border-2 border-black px-4 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Login</a>
            )}
          </div>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}><Menu size={28} /></button>
        </div>
      </nav>

      {/* HERO: Tipografi Raksasa */}
      <header className="pt-48 pb-20 px-6 max-w-6xl mx-auto">
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-yellow-300 border-2 border-black rounded-full -z-10 animate-bounce"></div>
          <h2 className="text-6xl md:text-[120px] font-black leading-[0.8] tracking-tighter uppercase mb-10">
            Smart <br/> <span className="text-blue-600">Living</span> <br/> Space.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
            <p className="text-xl font-bold leading-tight max-w-sm">
              Kost eksklusif di Malang dengan standar kenyamanan tinggi. Tanpa ribet, semua serba digital.
            </p>
            <div className="flex gap-4">
               <a href="#katalog" className="bg-[#1a1a1a] text-white text-xl font-black px-10 py-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase">
                 Booking Sekarang
               </a>
            </div>
          </div>
        </div>
      </header>

      {/* FASILITAS: Grid Boxy */}
      <section id="fasilitas" className="bg-blue-600 border-y-4 border-black py-16 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-0 border-4 border-black bg-black">
            {[
              { icon: Wifi, label: "100 MBPS", color: "bg-white" },
              { icon: ShieldCheck, label: "SAFE 24/7", color: "bg-yellow-300" },
              { icon: Utensils, label: "KITCHEN", color: "bg-white" },
              { icon: Car, label: "PARKING", color: "bg-emerald-400" }
            ].map((f, i) => (
              <div key={i} className={`${f.color} p-10 border-[1px] border-black flex flex-col items-center justify-center gap-4 group hover:invert transition-all`}>
                <f.icon size={40} strokeWidth={3} />
                <span className="font-black text-sm tracking-[0.2em]">{f.label}</span>
              </div>
            ))}
        </div>
      </section>

      {/* KATALOG: Card Berani */}
      <section id="katalog" className="max-w-6xl mx-auto px-6 py-32">
        <div className="flex items-center gap-4 mb-20">
          <div className="h-1 flex-1 bg-black"></div>
          <h3 className="text-5xl font-black italic uppercase tracking-tighter">Availability</h3>
          <div className="h-1 flex-1 bg-black"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {displayTypes.map((type, index) => (
            <div key={index} className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-300">
              <div className="h-64 border-b-4 border-black overflow-hidden relative">
                <img src={type.foto_kamar} alt={type.tipe_kamar} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-yellow-300 border-2 border-black px-3 py-1 font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                   {type.stokTersedia} Units Left
                </div>
              </div>
              <div className="p-8 bg-white flex-1">
                <h4 className="text-3xl font-black mb-2 uppercase tracking-tighter">{type.tipe_kamar}</h4>
                <div className="flex flex-wrap gap-2 mb-8">
                  {type.fasilitas.split(',').map((feat, idx) => (
                    <span key={idx} className="text-[9px] font-black uppercase px-2 py-1 border-2 border-black bg-slate-50">{feat}</span>
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  <div className="bg-blue-100 border-2 border-black p-3 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase">Start From</span>
                    <span className="text-xl font-black text-blue-700">Rp {parseInt(type.harga_bulanan).toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => type.stokTersedia > 0 && openBooking(type)} 
                    disabled={type.stokTersedia === 0} 
                    className="w-full bg-black text-white font-black py-4 uppercase tracking-[0.2em] text-sm hover:bg-blue-600 transition-colors disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    {type.stokTersedia > 0 ? 'Select Room' : 'Fully Booked'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t-4 border-black py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20">
            <div>
                <h2 className="text-5xl font-black italic mb-10 tracking-tighter uppercase underline decoration-yellow-300">Dykaya Malang</h2>
                <div className="space-y-4 text-lg font-bold">
                    <p className="flex items-center gap-4"> <MapPin strokeWidth={3} /> Jl. Taman Bunga Merak II No. 62</p>
                    <p className="flex items-center gap-4"> <Phone strokeWidth={3} /> +62 812 3456 7890</p>
                </div>
            </div>
            <div className="border-4 border-black shadow-[10px_10px_0px_0px_rgba(34,197,94,1)] h-64 overflow-hidden grayscale hover:grayscale-0 transition-all">
                <iframe title="map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15805.992641040854!2d112.6174061!3d-7.9473849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e78827687d272d7%3A0x1042701c9f4d1e2!2sLowokwaru%2C%20Malang%20City%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1712160000000!5m2!1sen!2sid" width="100%" height="100%" style={{border:0}}></iframe>
            </div>
        </div>
      </footer>

      {/* MODAL NEO-BRUTALISM */}
      {isModalOpen && selectedType && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white border-4 border-black shadow-[15px_15px_0px_0px_rgba(37,99,235,1)] w-full max-w-lg relative z-10 p-10 animate-in zoom-in-95">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-8 border-b-4 border-black pb-4">Check-In Info</h3>
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-black uppercase mb-2 block">Full Name</label>
                        <input type="text" className="w-full border-4 border-black p-4 text-lg font-bold outline-none focus:bg-yellow-50" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase mb-2 block">WhatsApp Number</label>
                        <input type="tel" className="w-full border-4 border-black p-4 text-lg font-bold outline-none focus:bg-yellow-50" value={formData.no_hp} onChange={(e) => setFormData({...formData, no_hp: e.target.value})} />
                    </div>
                    <button onClick={handleSubmitBooking} className="w-full bg-blue-600 text-white font-black py-6 text-xl uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">Confirm Booking</button>
                </div>
            </div>
        </div>
      )}

      {/* POPUP LOGIN & SUCCESS: Senada Gaya Neo-Brutalism */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="bg-emerald-400 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-12 text-center max-w-sm relative z-10">
                <h3 className="text-4xl font-black uppercase mb-4 tracking-tight">Nice!</h3>
                <p className="font-bold mb-8 italic">Booking lu udah masuk sistem. Tungguin WA dari kita ya!</p>
                <button onClick={() => window.location.reload()} className="bg-black text-white px-8 py-3 font-black uppercase">Oke Bro!</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;