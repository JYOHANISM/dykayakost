import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nama: '', email: '', no_hp: '', password: '' });
  const [loading, setLoading] = useState(false);
  
  // --- TAMBAHAN STATE UNTUK OTP ---
  const [step, setStep] = useState(1); // Step 1: Register, Step 2: Input OTP
  const [otpCode, setOtpCode] = useState('');

  // --- STATE MODAL ---
  const [modal, setModal] = useState({ 
    isOpen: false, 
    type: 'success', 
    title: '', 
    message: '' 
  });

  // FUNGSI 1: DAFTAR AKUN (KIRIM EMAIL OTP)
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();

        if(result.status === "Success") {
            setStep(2); // Pindah layar ke input OTP
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Cek Email Kamu!',
                message: 'Kode OTP pendaftaran telah dikirim ke email kamu.'
            });
        } else {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'Registrasi Gagal',
                message: result.message || 'Email mungkin sudah terdaftar.'
            });
        }
    } catch (error) {
        setModal({
            isOpen: true,
            type: 'error',
            title: 'Error Koneksi',
            message: 'Gagal terhubung ke server.'
        });
    } finally {
        setLoading(false);
    }
  };

  // FUNGSI 2: VERIFIKASI KODE OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const response = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, otp: otpCode })
        });
        const result = await response.json();

        if(result.status === "Success") {
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Verifikasi Berhasil!',
                message: 'Akun Kost Dykaya kamu sudah aktif. Silakan login.'
            });
        } else {
            setModal({
                isOpen: true,
                type: 'error',
                title: 'OTP Salah',
                message: result.message || 'Kode OTP yang kamu masukkan salah.'
            });
        }
    } catch (error) {
        setModal({
            isOpen: true,
            type: 'error',
            title: 'Error Koneksi',
            message: 'Gagal terhubung ke server.'
        });
    } finally {
        setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModal({ ...modal, isOpen: false });
    // Kalau berhasil verifikasi OTP, baru arahkan ke halaman Login
    if (modal.title === 'Verifikasi Berhasil!') {
        navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => step === 2 ? setStep(1) : navigate('/')} 
          className="mb-6 flex items-center text-slate-400 hover:text-blue-600 gap-2 text-sm font-bold transition"
        >
            <ArrowLeft size={16} /> {step === 2 ? 'Kembali Edit Data' : 'Kembali'}
        </button>

        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 flex items-center justify-center">
                <img 
                  src="/logo-baru.png" 
                  alt="Logo Dykaya" 
                  className="w-full h-full object-contain" 
                />
            </div>
        </div>

        {/* --- KONDISI TAMPILAN BERDASARKAN STEP --- */}
        {step === 1 ? (
          // LAYAR 1: FORM REGISTRASI
          <>
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Buat Akun Baru</h2>
            <p className="text-slate-500 text-center mb-8">Gabung jadi anak Kost Dykaya</p>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Nama Kamu" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">No. WhatsApp</label>
                <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="08xx..." value={formData.no_hp} onChange={(e) => setFormData({...formData, no_hp: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                <input type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="email@contoh.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <input type="password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              </div>
              
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg mt-4 shadow-blue-900/20 disabled:bg-slate-400">
                {loading ? 'MENDAFTARKAN...' : 'DAFTAR SEKARANG'}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-slate-500">
                Sudah punya akun? <span className="text-blue-600 font-bold cursor-pointer hover:underline" onClick={() => navigate('/login')}>Login disini</span>
            </p>
          </>
        ) : (
          // LAYAR 2: FORM INPUT OTP
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Verifikasi Email</h2>
            <p className="text-slate-500 text-center mb-8">
              Kami telah mengirim 4 digit kode OTP ke email <br/> 
              <span className="font-bold text-slate-700">{formData.email}</span>
            </p>
            
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 text-center">Masukkan Kode OTP</label>
                <input 
                  type="number" 
                  maxLength="4"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-center text-2xl tracking-widest font-bold" 
                  placeholder="0000" 
                  value={otpCode} 
                  onChange={(e) => setOtpCode(e.target.value)} 
                  required 
                />
              </div>
              
              <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition shadow-lg mt-4 shadow-emerald-900/20 disabled:bg-slate-400">
                {loading ? 'MEMVERIFIKASI...' : 'VERIFIKASI AKUN'}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* POP-UP MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleModalClose}></div>
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative z-50 text-center p-8 animate-fade-in">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{modal.title}</h3>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">{modal.message}</p>
                <button 
                    onClick={handleModalClose} 
                    className={`w-full font-bold py-3.5 rounded-xl text-white transition shadow-lg ${
                        modal.type === 'success' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                >
                    {modal.title === 'Verifikasi Berhasil!' ? 'Login Sekarang' : 'Tutup & Lanjut'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Register;