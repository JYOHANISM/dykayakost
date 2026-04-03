import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nama: '', email: '', no_hp: '', password: '' });
  const [loading, setLoading] = useState(false);

  // --- STATE MODAL ---
  const [modal, setModal] = useState({ 
    isOpen: false, 
    type: 'success', // success, error
    title: '', 
    message: '' 
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // --- PATH RELATIF UNTUK DEPLOYMENT VERCEL ---
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
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 relative z-10">
        
        <button onClick={() => navigate('/')} className="mb-6 flex items-center text-slate-400 hover:text-blue-600 gap-2 text-sm font-bold transition">
            <ArrowLeft size={16} /> Kembali
        </button>

        <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                <UserPlus className="w-6 h-6" />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Buat Akun Baru</h2>
        <p className="text-slate-500 text-center mb-8">Gabung jadi anak Kost Dykaya</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
      </div>

      {/* POP-UP MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={handleModalClose}></div>
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative z-50 overflow-hidden text-center p-8 animate-fade-in transform scale-100 transition-all">
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                    modal.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                    {modal.type === 'success' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{modal.title}</h3>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">{modal.message}</p>

                <button 
                    onClick={handleModalClose} 
                    className={`w-full font-bold py-3.5 rounded-xl text-white transition shadow-lg ${
                        modal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20'
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