import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nama: '', email: '', no_hp: '', password: '' });
  const [loading, setLoading] = useState(false);

  // --- STATE MODAL ---
  const [modal, setModal] = useState({ 
    isOpen: false, 
    type: 'success', 
    title: '', 
    message: '' 
  });

  const handleSubmit = async (e) => {
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
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Registrasi Berhasil!',
                message: 'Akun Anda sudah siap. Silakan login untuk melanjutkan.'
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
            message: 'Gagal terhubung ke server. Pastikan database TiDB Anda aktif.'
        });
    } finally {
        setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModal({ ...modal, isOpen: false });
    if (modal.type === 'success') {
        navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl w-full max-w-md border border-slate-100 relative overflow-hidden">
        
        {/* Dekorasi halus */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

        <button onClick={() => navigate('/')} className="mb-8 flex items-center text-slate-400 hover:text-blue-600 gap-2 text-xs font-black uppercase tracking-widest transition group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali
        </button>

        <div className="flex justify-center mb-6">
            {/* FIX: MENGGANTI ICON DENGAN LOGO BARU KAMU */}
            <div className="w-16 h-16 flex items-center justify-center">
                <img 
                  src="/logo-baru.png" 
                  alt="Logo Dykaya" 
                  className="w-full h-full object-contain" 
                />
            </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-black italic text-slate-900 tracking-tighter uppercase">Buat Akun</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Gabung jadi anak Kost Dykaya</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Full Name</label>
            <input type="text" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none transition font-bold text-sm" placeholder="Nama Lengkap" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} required />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">WhatsApp Number</label>
            <input type="number" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none transition font-bold text-sm" placeholder="08xx..." value={formData.no_hp} onChange={(e) => setFormData({...formData, no_hp: e.target.value})} required />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Email Address</label>
            <input type="email" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none transition font-bold text-sm" placeholder="email@contoh.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Password</label>
            <input type="password" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-600 outline-none transition font-bold text-sm" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-slate-900 transition shadow-xl mt-4 uppercase tracking-widest text-xs disabled:bg-slate-400">
            {loading ? 'MENDAFTARKAN...' : 'DAFTAR SEKARANG'}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-slate-50">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Sudah punya akun? <span className="text-blue-600 cursor-pointer hover:text-slate-900 transition" onClick={() => navigate('/login')}>Login disini</span>
            </p>
        </div>
      </div>

      {/* POP-UP MODAL - Icon Centang Sudah Dihapus */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleModalClose}></div>
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] relative z-50 text-center p-10 shadow-2xl animate-fade-in">
                
                <h3 className="text-2xl font-black italic text-slate-900 mb-2 uppercase tracking-tighter">{modal.title}</h3>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">{modal.message}</p>

                <button 
                    onClick={handleModalClose} 
                    className={`w-full font-black py-4 rounded-2xl text-white transition shadow-xl uppercase tracking-widest text-xs ${
                        modal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                >
                    {modal.type === 'success' ? 'Login Sekarang' : 'Coba Lagi'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Register;