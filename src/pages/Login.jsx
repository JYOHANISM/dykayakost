import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        // --- SEKARANG MENGGUNAKAN PATH RELATIF UNTUK VERCEL ---
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

            // Redireksi sesuai Role
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
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        
        {/* TOMBOL KEMBALI KE BERANDA */}
        <button onClick={() => navigate('/')} className="mb-6 flex items-center text-slate-400 hover:text-blue-600 gap-2 text-sm font-bold transition">
            <ArrowLeft size={16} /> Kembali ke Beranda
        </button>

        <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Star fill="currentColor" className="w-8 h-8" />
            </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Selamat Datang!</h2>
        <p className="text-slate-500 text-center mb-8">Login untuk akses Kost Dykaya</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="nama@email.com"
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 disabled:bg-slate-400"
          >
            {loading ? 'MENGECEK AKUN...' : 'LOGIN'}
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-slate-500">
            Belum punya akun? <span className="text-blue-600 font-bold cursor-pointer hover:underline" onClick={() => navigate('/register')}>Daftar Akun Baru</span>
        </p>
      </div>
    </div>
  );
};

export default Login;