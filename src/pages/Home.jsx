import React, { useState, useEffect } from 'react';
import { MapPin, Star, XCircle, Phone, Wifi, Car, Utensils, ShieldCheck, Menu, X, User, BedDouble, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── Google Fonts injected once ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --cream:    #F7F2E9;
      --parchment:#EDE5D4;
      --sand:     #D9C9A8;
      --espresso: #1E1108;
      --brown:    #3D2314;
      --caramel:  #8B5E34;
      --amber:    #C4762A;
      --amber-lt: #E8A45A;
      --white:    #FDFAF5;
      --text-muted: #7A6348;
    }

    body { background: var(--cream); }

    .font-display { font-family: 'Playfair Display', Georgia, serif; }
    .font-body    { font-family: 'DM Sans', sans-serif; }

    /* ── scroll behaviour ── */
    html { scroll-behavior: smooth; }

    /* ── navbar ── */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 50;
      background: var(--cream);
      border-bottom: 1.5px solid var(--sand);
      font-family: 'DM Sans', sans-serif;
    }
    .navbar-inner {
      max-width: 1200px; margin: 0 auto;
      padding: 0 2rem; height: 72px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .logo-text { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 900; color: var(--espresso); letter-spacing: -0.5px; }
    .logo-text span { color: var(--amber); }
    .logo-sub { font-family: 'DM Sans', sans-serif; font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: var(--text-muted); }

    .nav-links { display: flex; align-items: center; gap: 2.5rem; list-style: none; }
    .nav-links a { font-size: 0.85rem; font-weight: 500; color: var(--brown); text-decoration: none; letter-spacing: 0.02em; transition: color .2s; }
    .nav-links a:hover { color: var(--amber); }

    .btn-login {
      background: var(--espresso); color: var(--cream);
      padding: 0.6rem 1.4rem; border-radius: 3px;
      font-size: 0.8rem; font-weight: 600; letter-spacing: 0.05em;
      text-transform: uppercase; text-decoration: none;
      transition: background .2s;
    }
    .btn-login:hover { background: var(--amber); }

    /* ── hero ── */
    .hero-wrap {
      padding-top: 100px;
      max-width: 1200px; margin: 0 auto;
      padding-left: 2rem; padding-right: 2rem;
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      align-items: end;
      padding: 5rem 0 4rem;
      border-bottom: 1.5px solid var(--sand);
    }
    .hero-eyebrow {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.7rem; letter-spacing: 4px;
      text-transform: uppercase; color: var(--amber);
      font-weight: 600; margin-bottom: 1.5rem;
      display: flex; align-items: center; gap: 0.75rem;
    }
    .hero-eyebrow::before {
      content: ''; display: block;
      width: 40px; height: 1.5px; background: var(--amber);
    }
    .hero-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.8rem, 6vw, 5.5rem);
      font-weight: 900; line-height: 1.0;
      color: var(--espresso);
      margin-bottom: 1.5rem;
      letter-spacing: -1px;
    }
    .hero-title em { font-style: italic; color: var(--amber); }
    .hero-address {
      display: flex; align-items: flex-start; gap: 0.6rem;
      color: var(--text-muted); font-size: 0.9rem;
      font-family: 'DM Sans', sans-serif; margin-bottom: 2.5rem;
    }
    .btn-cta {
      display: inline-block;
      background: var(--amber); color: var(--white);
      padding: 1rem 2.5rem; border-radius: 3px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 600; font-size: 0.85rem;
      letter-spacing: 0.08em; text-transform: uppercase;
      text-decoration: none; transition: background .2s, transform .2s;
    }
    .btn-cta:hover { background: var(--brown); transform: translateY(-2px); }

    .hero-right { position: relative; }
    .hero-img-frame {
      border-radius: 6px; overflow: hidden;
      aspect-ratio: 4/5; position: relative;
    }
    .hero-img-frame img { width: 100%; height: 100%; object-fit: cover; }
    .hero-badge {
      position: absolute; bottom: -1.5rem; left: -1.5rem;
      background: var(--amber); color: var(--white);
      font-family: 'Playfair Display', serif;
      padding: 1.2rem 1.5rem; border-radius: 4px;
      box-shadow: 0 8px 32px rgba(196,118,42,.3);
    }
    .hero-badge-num { font-size: 2.5rem; font-weight: 900; line-height: 1; display: block; }
    .hero-badge-txt { font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; font-family: 'DM Sans',sans-serif; opacity: .85; }

    .promo-strip {
      background: var(--espresso);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.75rem; letter-spacing: 2px; text-transform: uppercase;
      color: var(--sand); padding: 0.6rem 0; text-align: center;
    }
    .promo-strip span { color: var(--amber-lt); font-weight: 600; }

    /* ── stats bar ── */
    .stats-bar {
      display: flex; gap: 0;
      border-bottom: 1.5px solid var(--sand);
      max-width: 1200px; margin: 0 auto; padding: 0 2rem;
    }
    .stat-item {
      flex: 1; padding: 2rem 1.5rem;
      border-right: 1.5px solid var(--sand);
      display: flex; align-items: baseline; gap: 0.75rem;
    }
    .stat-item:last-child { border-right: none; }
    .stat-num { font-family: 'Playfair Display', serif; font-size: 2.5rem; font-weight: 900; color: var(--espresso); }
    .stat-desc { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }

    /* ── section titles ── */
    .sec-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.65rem; letter-spacing: 4px; text-transform: uppercase;
      color: var(--amber); font-weight: 600; margin-bottom: 0.75rem;
    }
    .sec-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.8rem, 3.5vw, 2.8rem); font-weight: 900;
      color: var(--espresso); line-height: 1.1; letter-spacing: -0.5px;
    }
    .sec-title em { font-style: italic; color: var(--caramel); }

    /* ── fasilitas ── */
    .fasilitas-section {
      max-width: 1200px; margin: 0 auto;
      padding: 5rem 2rem;
      display: grid; grid-template-columns: 1fr 2fr;
      gap: 4rem; align-items: start;
      border-bottom: 1.5px solid var(--sand);
    }
    .fasilitas-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--sand); border: 1px solid var(--sand); }
    .fasilitas-item {
      background: var(--white);
      padding: 2rem 1.75rem;
      transition: background .2s;
    }
    .fasilitas-item:hover { background: var(--parchment); }
    .fasilitas-icon { color: var(--amber); margin-bottom: 0.75rem; }
    .fasilitas-name { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; color: var(--espresso); }
    .fasilitas-desc { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem; }

    /* ── katalog ── */
    .katalog-section {
      max-width: 1200px; margin: 0 auto; padding: 5rem 2rem;
    }
    .katalog-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; }
    .katalog-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 2px; background: var(--sand); border: 1px solid var(--sand); }
    .room-card { background: var(--white); overflow: hidden; transition: background .2s; }
    .room-card:hover { background: var(--parchment); }
    .room-img { position: relative; aspect-ratio: 16/10; overflow: hidden; }
    .room-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s; }
    .room-card:hover .room-img img { transform: scale(1.04); }
    .room-tag {
      position: absolute; top: 1rem; left: 1rem;
      font-family: 'DM Sans', sans-serif; font-size: 0.65rem;
      font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
      padding: 0.35rem 0.8rem; border-radius: 2px;
    }
    .tag-avail { background: var(--espresso); color: var(--amber-lt); }
    .tag-sold { background: #7A3030; color: #FFB5B5; }
    .room-price {
      position: absolute; bottom: 1rem; right: 1rem;
      background: var(--amber); color: var(--white);
      font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1rem;
      padding: 0.4rem 0.9rem; border-radius: 2px;
    }
    .room-body { padding: 1.75rem 2rem; }
    .room-type-name { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 900; color: var(--espresso); margin-bottom: 0.75rem; }
    .room-feats { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem; }
    .feat-tag {
      font-family: 'DM Sans', sans-serif; font-size: 0.65rem; font-weight: 500;
      letter-spacing: 0.5px; padding: 0.25rem 0.65rem;
      background: var(--parchment); color: var(--brown);
      border: 1px solid var(--sand);
    }
    .btn-book {
      width: 100%; padding: 0.9rem;
      font-family: 'DM Sans', sans-serif; font-weight: 600;
      font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase;
      border: none; border-radius: 2px; cursor: pointer; transition: background .2s, color .2s;
    }
    .btn-book-active { background: var(--espresso); color: var(--cream); }
    .btn-book-active:hover { background: var(--amber); }
    .btn-book-disabled { background: var(--sand); color: var(--text-muted); cursor: not-allowed; }

    /* ── footer ── */
    .footer {
      background: var(--espresso); color: var(--sand);
      font-family: 'DM Sans', sans-serif;
    }
    .footer-inner {
      max-width: 1200px; margin: 0 auto; padding: 5rem 2rem 3rem;
      display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: start;
    }
    .footer-logo { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; color: var(--white); margin-bottom: 1rem; }
    .footer-logo span { color: var(--amber); font-style: italic; }
    .footer-desc { font-size: 0.85rem; line-height: 1.8; color: var(--sand); margin-bottom: 2rem; max-width: 360px; }
    .footer-contact { display: flex; flex-direction: column; gap: 0.75rem; }
    .footer-contact-row { display: flex; align-items: flex-start; gap: 0.75rem; font-size: 0.85rem; }
    .footer-contact-row svg { color: var(--amber); flex-shrink: 0; margin-top: 1px; }
    .footer-map { aspect-ratio: 4/3; border-radius: 4px; overflow: hidden; border: 2px solid var(--caramel); }
    .footer-bottom {
      border-top: 1px solid #3D2314;
      max-width: 1200px; margin: 0 auto; padding: 1.5rem 2rem;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 0.75rem; color: var(--text-muted);
    }

    /* ── modals ── */
    .modal-backdrop {
      position: fixed; inset: 0; z-index: 60;
      background: rgba(30,17,8,.55); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .modal-box {
      background: var(--white); width: 100%; max-width: 480px;
      border-radius: 4px; box-shadow: 0 24px 80px rgba(0,0,0,.35);
      overflow: hidden; position: relative; z-index: 1;
      animation: rise .3s ease;
    }
    @keyframes rise { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    .modal-head {
      padding: 1.5rem 2rem; border-bottom: 1px solid var(--sand);
      display: flex; justify-content: space-between; align-items: center;
      background: var(--parchment);
    }
    .modal-head h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--espresso); }
    .modal-body { padding: 2rem; }
    .modal-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; }
    .modal-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: var(--espresso); text-align: center; margin-bottom: 0.5rem; }
    .modal-desc { font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: var(--text-muted); text-align: center; margin-bottom: 2rem; }
    .input-label { display: block; font-family: 'DM Sans',sans-serif; font-size: 0.65rem; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; }
    .input-field {
      width: 100%; background: var(--cream); border: 1.5px solid var(--sand);
      border-radius: 3px; padding: 0.75rem 1rem;
      font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: var(--espresso);
      outline: none; transition: border-color .2s;
    }
    .input-field:focus { border-color: var(--amber); }
    .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }
    .btn-primary {
      width: 100%; padding: 0.9rem;
      background: var(--amber); color: var(--white);
      border: none; border-radius: 3px; cursor: pointer;
      font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 0.85rem;
      letter-spacing: 0.08em; text-transform: uppercase;
      transition: background .2s; margin-top: 0.5rem;
    }
    .btn-primary:hover { background: var(--espresso); }
    .btn-ghost {
      width: 100%; padding: 0.75rem; background: transparent;
      border: none; cursor: pointer; color: var(--text-muted);
      font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 0.85rem;
      margin-top: 0.5rem; transition: color .2s;
    }
    .btn-ghost:hover { color: var(--espresso); }
    .form-error { background: #FEF0F0; border: 1px solid #F5C6C6; color: #A83030; padding: 0.7rem 1rem; border-radius: 3px; font-size: 0.82rem; font-family: 'DM Sans',sans-serif; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }

    /* ── mobile menu ── */
    .mobile-menu {
      position: fixed; inset: 0; z-index: 45;
      background: var(--espresso);
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2.5rem;
    }
    .mobile-menu a { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; color: var(--cream); text-decoration: none; }
    .mobile-menu a:hover { color: var(--amber); }

    @media (max-width: 768px) {
      .hero-grid { grid-template-columns: 1fr; padding-top: 3rem; }
      .hero-right { display: none; }
      .stats-bar { flex-wrap: wrap; }
      .stat-item { flex: 1 1 45%; border-right: 0; border-bottom: 1.5px solid var(--sand); padding: 1.5rem 1rem; }
      .fasilitas-section { grid-template-columns: 1fr; gap: 2.5rem; }
      .katalog-grid { grid-template-columns: 1fr; }
      .footer-inner { grid-template-columns: 1fr; gap: 3rem; }
      .nav-links { display: none; }
      .input-grid { grid-template-columns: 1fr; }
    }
  `}</style>
);

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
      .then(r => r.json())
      .then(data => {
        setRawRooms(data);
        const grouped = {};
        data.forEach(room => {
          if (!grouped[room.tipe_kamar]) grouped[room.tipe_kamar] = { ...room, totalStok: 0, stokTersedia: 0, nextAvailableId: null };
          grouped[room.tipe_kamar].totalStok++;
          if (room.status === 'tersedia') {
            grouped[room.tipe_kamar].stokTersedia++;
            if (!grouped[room.tipe_kamar].nextAvailableId) grouped[room.tipe_kamar].nextAvailableId = room.id;
          }
        });
        setDisplayTypes(Object.values(grouped));
      })
      .catch(e => console.error('Gagal ambil data:', e));
  }, []);

  const openBooking = (typeData) => {
    if (!localStorage.getItem('userId')) { setShowLoginModal(true); return; }
    setSelectedType(typeData);
    setBookingTargetId(typeData.nextAvailableId);
    setFormError('');
    setFormData({ nama: localStorage.getItem('userName') || '', no_hp: '' });
    setIsModalOpen(true);
  };

  const handleSubmitBooking = async () => {
    if (!formData.nama || !formData.no_hp) { setFormError('Nama dan Nomor WhatsApp wajib diisi!'); return; }
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: formData.nama, no_hp: formData.no_hp, room_id: bookingTargetId, tipe_kamar: selectedType.tipe_kamar, user_id: localStorage.getItem('userId') })
      });
      const result = await res.json();
      if (result.status === 'Success') { setIsModalOpen(false); setShowSuccessModal(true); setFormData({ nama: '', no_hp: '' }); }
      else setFormError('Gagal booking, coba lagi nanti.');
    } catch { setFormError('Error koneksi ke server!'); }
  };

  const dashboardLink = userRole === 'admin' ? '/admin' : '/user';
  const availableCount = rawRooms.filter(r => r.status === 'tersedia').length;

  return (
    <>
      <FontLoader />

      {/* ── PROMO STRIP ── */}
      <div className="promo-strip font-body">
        🏷 Promo Spesial — <span>Diskon 5% bulan pertama</span> untuk penghuni baru. Hubungi segera!
      </div>

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="#" onClick={() => window.scrollTo(0,0)} style={{ textDecoration: 'none' }}>
            <div className="logo-text">KOST<span>DYKAYA</span></div>
            <div className="logo-sub">Comfort Living — Malang</div>
          </a>
          <ul className="nav-links">
            <li><a href="#">Beranda</a></li>
            <li><a href="#fasilitas">Fasilitas</a></li>
            <li><a href="#katalog">Katalog</a></li>
            <li><a href="#lokasi">Lokasi</a></li>
            {currentUser
              ? <li><a href={dashboardLink} style={{ color: 'var(--amber)', fontWeight: 600 }}><User size={15} style={{display:'inline',marginRight:'4px'}}/>Halo, {currentUser}</a></li>
              : <li><a href="/login" className="btn-login">Login Penghuni</a></li>
            }
          </ul>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--espresso)', display: 'none' }}>
            {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="hero-wrap">
        <div className="hero-grid">
          <div>
            <p className="hero-eyebrow font-body">Hunian Kos Malang</p>
            <h1 className="hero-title font-display">
              Rumah Kedua<br/>yang <em>Nyaman</em><br/>&amp; Strategis
            </h1>
            <div className="hero-address font-body">
              <MapPin size={16} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: '2px' }}/>
              Jl. Taman Bunga Merak II No.62, Lowokwaru, Malang
            </div>
            <a href="#katalog" className="btn-cta">Lihat Kamar Tersedia</a>
          </div>
          <div className="hero-right">
            <div className="hero-img-frame">
              <img
                src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80"
                alt="Kost Dykaya"
              />
            </div>
            <div className="hero-badge">
              <span className="hero-badge-num font-display">{availableCount || '—'}</span>
              <span className="hero-badge-txt">Unit Tersedia</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ borderBottom: '1.5px solid var(--sand)' }}>
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-num font-display">{rawRooms.length || '—'}</span>
            <span className="stat-desc font-body">Total<br/>Kamar</span>
          </div>
          <div className="stat-item">
            <span className="stat-num font-display">24<span style={{fontSize:'1.2rem'}}>/7</span></span>
            <span className="stat-desc font-body">Keamanan<br/>CCTV</span>
          </div>
          <div className="stat-item">
            <span className="stat-num font-display">100<span style={{fontSize:'1.2rem'}}>%</span></span>
            <span className="stat-desc font-body">WiFi Fiber<br/>Stabil</span>
          </div>
          <div className="stat-item">
            <span className="stat-num font-display">★ 4.9</span>
            <span className="stat-desc font-body">Rating<br/>Penghuni</span>
          </div>
        </div>
      </div>

      {/* ── FASILITAS ── */}
      <section id="fasilitas" style={{ scrollMarginTop: '80px' }}>
        <div className="fasilitas-section">
          <div>
            <p className="sec-label font-body">Fasilitas</p>
            <h2 className="sec-title font-display">Yang Anda<br/>Dapatkan</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '1.25rem', lineHeight: 1.8 }}>
              Semua yang dibutuhkan untuk kehidupan kos yang produktif dan nyaman, tanpa biaya tambahan tersembunyi.
            </p>
          </div>
          <div className="fasilitas-grid">
            {[
              { icon: <Wifi size={24}/>, name: 'Free WiFi', desc: 'Fiber optik, stabil 24 jam' },
              { icon: <Utensils size={24}/>, name: 'Dapur Bersama', desc: 'Peralatan lengkap' },
              { icon: <Car size={24}/>, name: 'Parkir Luas', desc: 'Motor & mobil, aman' },
              { icon: <ShieldCheck size={24}/>, name: 'CCTV 24 Jam', desc: 'Keamanan terpantau' },
            ].map((f, i) => (
              <div key={i} className="fasilitas-item">
                <div className="fasilitas-icon">{f.icon}</div>
                <div className="fasilitas-name font-display">{f.name}</div>
                <div className="fasilitas-desc font-body">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KATALOG ── */}
      <section id="katalog" style={{ scrollMarginTop: '80px', borderTop: '1.5px solid var(--sand)' }}>
        <div className="katalog-section">
          <div className="katalog-header">
            <div>
              <p className="sec-label font-body">Katalog Kamar</p>
              <h2 className="sec-title font-display">Pilih Tipe<br/><em>Favoritmu</em></h2>
            </div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {availableCount} unit tersedia hari ini
            </p>
          </div>

          {displayTypes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', fontFamily: "'DM Sans',sans-serif" }}>Memuat data kamar…</div>
          ) : (
            <div className="katalog-grid">
              {displayTypes.map((type, i) => (
                <div key={i} className="room-card">
                  <div className="room-img">
                    <img src={type.foto_kamar} alt={type.tipe_kamar}/>
                    <span className={`room-tag ${type.stokTersedia > 0 ? 'tag-avail' : 'tag-sold'}`}>
                      {type.stokTersedia > 0 ? `${type.stokTersedia} Unit Tersedia` : 'Stok Habis'}
                    </span>
                    <span className="room-price font-display">
                      Rp {parseInt(type.harga_bulanan).toLocaleString('id-ID')}<span style={{fontSize:'0.7rem', fontFamily:"'DM Sans',sans-serif", fontWeight:400}}>/bln</span>
                    </span>
                  </div>
                  <div className="room-body">
                    <div className="room-type-name font-display">{type.tipe_kamar}</div>
                    <div className="room-feats">
                      <span className="feat-tag font-body"><BedDouble size={10} style={{display:'inline',marginRight:'4px'}}/>Total {type.totalStok} Kamar</span>
                      {type.fasilitas.split(',').map((f, idx) => (
                        <span key={idx} className="feat-tag font-body">{f.trim()}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => type.stokTersedia > 0 && openBooking(type)}
                      disabled={type.stokTersedia === 0}
                      className={`btn-book ${type.stokTersedia > 0 ? 'btn-book-active' : 'btn-book-disabled'}`}
                    >
                      {type.stokTersedia > 0 ? 'Pilih Kamar Ini →' : 'Stok Habis'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="lokasi" style={{ scrollMarginTop: '80px' }} className="footer">
        <div className="footer-inner">
          <div>
            <div className="footer-logo font-display">Kost <span>Dykaya</span></div>
            <p className="footer-desc font-body">Hunian nyaman, aman, dan strategis di jantung kota Malang. Cocok untuk mahasiswa dan karyawan muda.</p>
            <div className="footer-contact font-body">
              <div className="footer-contact-row"><MapPin size={16}/><span>Jl. Taman Bunga Merak II No.62, Lowokwaru, Malang</span></div>
              <div className="footer-contact-row"><Phone size={16}/><span>0812-3456-7890 (Ibu Kost)</span></div>
            </div>
          </div>
          <div className="footer-map">
            <iframe title="Lokasi" src="https://maps.google.com/maps?q=Malang&t=&z=13&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style={{border:0}} loading="lazy"/>
          </div>
        </div>
        <div className="footer-bottom font-body">
          <span>© 2026 Kost Dykaya Malang</span>
          <span>Malang, Jawa Timur</span>
        </div>
      </footer>

      {/* ── MODAL: LOGIN REQUIRED ── */}
      {showLoginModal && (
        <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
              <div className="modal-icon" style={{ background: '#FFF3E0' }}>
                <Lock size={28} style={{ color: 'var(--amber)' }}/>
              </div>
              <div className="modal-title font-display">Akses Terbatas</div>
              <p className="modal-desc font-body">Silakan login terlebih dahulu untuk melanjutkan pemesanan kamar.</p>
              <button onClick={() => navigate('/login')} className="btn-primary">Login Sekarang</button>
              <button onClick={() => setShowLoginModal(false)} className="btn-ghost">Nanti Dulu</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: SUCCESS ── */}
      {showSuccessModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
              <div className="modal-icon" style={{ background: '#EDFAF1' }}>
                <CheckCircle size={28} style={{ color: '#2D9E5E' }}/>
              </div>
              <div className="modal-title font-display">Booking Berhasil!</div>
              <p className="modal-desc font-body">Admin akan segera menghubungi Anda via WhatsApp untuk konfirmasi.</p>
              <button onClick={() => { setShowSuccessModal(false); window.location.reload(); }} className="btn-primary" style={{ background: '#2D9E5E' }}>OK, Siap!</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: BOOKING FORM ── */}
      {isModalOpen && selectedType && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3 className="font-display">Booking {selectedType.tipe_kamar}</h3>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Sistem memilihkan unit terbaik untukmu
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <XCircle size={22}/>
              </button>
            </div>
            <div className="modal-body">
              {formError && (
                <div className="form-error font-body">
                  <AlertCircle size={15}/> {formError}
                </div>
              )}
              <div className="input-grid">
                <div>
                  <label className="input-label">Nama Lengkap</label>
                  <input className="input-field" type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})}/>
                </div>
                <div>
                  <label className="input-label">No. WhatsApp</label>
                  <input className="input-field" type="tel" placeholder="08xx-xxxx-xxxx" value={formData.no_hp} onChange={e => setFormData({...formData, no_hp: e.target.value})}/>
                </div>
              </div>
              <button onClick={handleSubmitBooking} className="btn-primary">Konfirmasi Booking →</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;