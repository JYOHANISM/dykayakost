import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  
  // State Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // State Lupa Password
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Input Email, 2: Input OTP & New Pass
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // --- HANDLER LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();

        if(result.status === "Success") {
            localStorage.setItem('userId', result.userId);
            localStorage.setItem('userName', result.name);
            localStorage.setItem('userRole', result.role);

            if(result.role === 'admin') navigate('/admin');
            else navigate('/user');
        } else {
            alert("Login Gagal! Email atau Password salah.");
        }
    } catch (error) { 
        alert("Error koneksi server! Pastikan database TiDB Anda aktif."); 
    } finally { 
        setLoading(false); 
    }
  };

  // --- HANDLER MINTA OTP RESET ---
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await fetch('/api/request-reset-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: resetEmail })
        });
        const data = await res.json();
        
        if(data.status === 'Success') {
            alert('Kode OTP berhasil dikirim ke email kamu!');
            setResetStep(2); // Pindah ke step masukin OTP
        } else {
            alert(data.message || 'Email tidak terdaftar!');
        }
    } catch(err) {
        alert('Koneksi server terputus.');
    } finally {
        setLoading(false);
    }
  };

  // --- HANDLER RESET PASSWORD ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await fetch('/api/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: resetEmail, otp_code: otp, new_password: newPassword })
        });
        const data = await res.json();
        
        if(data.status === 'Success') {
            alert('Password berhasil direset! Silakan login dengan password baru.');
            // Balik ke mode login awal
            setIsResetMode(false);
            setResetStep(1);
            setOtp('');
            setNewPassword('');
            setPassword('');
        } else {
            alert(data.message || 'Kode OTP salah atau tidak valid!');
        }
    } catch(err) {
        alert('Koneksi server terputus.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 relative overflow-hidden">
        
        {/* TOMBOL KEMBALI */}
        <button onClick={() => isResetMode ? setIsResetMode(false) : navigate('/')} className="mb-6 flex items-center text-slate-400 hover:text-blue-600 gap-2 text-sm font-bold transition">
            <ArrowLeft size={16} /> {isResetMode ? 'Kembali ke Login' : 'Kembali ke Beranda'}
        </button>

        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 flex items-center justify-center">
                <img src="/logo-baru.png" alt="Logo Dykaya" className="w-full h-full object-contain" />
            </div>
        </div>

        {/* =========================================
            TAMPILAN 1: FORM LOGIN NORMAL
        ========================================= */}
        {!isResetMode && (
            <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Selamat Datang!</h2>
                <p className="text-slate-500 text-center mb-8">Login untuk akses Kost Dykaya</p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                        <input type="email" placeholder="nama@email.com" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-bold text-slate-700">Password</label>
                            <button type="button" onClick={() => setIsResetMode(true)} className="text-xs text-blue-600 font-bold hover:underline">Lupa Password?</button>
                        </div>
                        <input type="password" placeholder="••••••••" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 disabled:bg-slate-400">
                        {loading ? 'MENGECEK AKUN...' : 'LOGIN'}
                    </button>
                </form>
                
                <p className="text-center mt-6 text-sm text-slate-500">
                    Belum punya akun? <span className="text-blue-600 font-bold cursor-pointer hover:underline" onClick={() => navigate('/register')}>Daftar Akun Baru</span>
                </p>
            </div>
        )}

        {/* =========================================
            TAMPILAN 2: LUPA PASSWORD (RESET MODE)
        ========================================= */}
        {isResetMode && (
            <div className="animate-fade-in">
                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                    <KeyRound size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Reset Password</h2>
                
                {/* STEP 1: MASUKIN EMAIL */}
                {resetStep === 1 && (
                    <form onSubmit={handleRequestOTP} className="space-y-4">
                        <p className="text-slate-500 text-center mb-6 text-sm">Masukkan email yang terdaftar, kami akan mengirimkan kode OTP untuk reset password.</p>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email Terdaftar</label>
                            <input type="email" placeholder="nama@email.com" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 disabled:bg-blue-400">
                            {loading ? 'MENGIRIM...' : 'KIRIM KODE OTP'}
                        </button>
                    </form>
                )}

                {/* STEP 2: MASUKIN OTP & PASSWORD BARU */}
                {resetStep === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <p className="text-emerald-600 bg-emerald-50 p-3 rounded-xl text-center mb-6 text-sm font-medium border border-emerald-100">Cek kotak masuk/spam email kamu untuk melihat kode OTP.</p>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Kode OTP (4 Digit)</label>
                            <input type="text" maxLength="4" placeholder="1234" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition text-center tracking-[1em] font-bold text-xl" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Password Baru</label>
                            <input type="password" placeholder="Minimal 6 karakter" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength="6" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 disabled:bg-slate-400 mt-2">
                            {loading ? 'MERESET...' : 'SIMPAN PASSWORD BARU'}
                        </button>
                    </form>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default Login;
