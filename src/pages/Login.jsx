import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
            alert("Login Gagal! Email/Password salah.");
        }
    } catch (error) { 
        alert("Error koneksi server! Pastikan database TiDB Anda aktif."); 
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl w-full max-w-md border border-slate-100 relative overflow-hidden">
        
        {/* Dekorasi halus biar gak kaku */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

        {/* TOMBOL KEMBALI KE BERANDA */}
        <button onClick={() => navigate('/')} className="mb-8 flex items-center text-slate-400 hover:text-blue-600 gap-2 text-xs font-black uppercase tracking-widest transition group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali
        </button>

        <div className="flex justify-center mb-6">
            {/* FIX: MENGGANTI ICON BINTANG DENGAN LOGO BARU KAMU */}
            <div className="w-16 h-16 flex items-center justify-center">
                <img 
                  src="/logo-baru.png" 
                  alt="Logo Dykaya" 
                  className="w-full h-full object-contain" 
                />
            </div>
        </div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black italic text-slate-900 tracking-tighter uppercase">Selamat Datang!</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Login untuk akses Kost Dykaya</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="nama@email.com"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none transition font-bold text-sm" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Security Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none transition font-bold text-sm" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition shadow-xl shadow-slate-900/20 disabled:bg-slate-400 uppercase tracking-widest text-xs"
          >
            {loading ? 'MENGECEK AKUN...' : 'LOGIN SEKARANG'}
          </button>
        </form>
        
        <div className="text-center mt-8 pt-6 border-t border-slate-50">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Belum punya akun? <span className="text-blue-600 cursor-pointer hover:text-slate-900 transition" onClick={() => navigate('/register')}>Daftar Akun Baru</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;