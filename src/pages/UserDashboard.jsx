import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Home, AlertCircle, CheckCircle, ArrowLeft, Wrench, Send, XCircle, AlertTriangle, CreditCard, Copy, Check, Upload, Clock, ShieldCheck, HelpCircle } from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [judulKeluhan, setJudulKeluhan] = useState('');
  const [isiKeluhan, setIsiKeluhan] = useState('');
  
  const [selectedBank, setSelectedBank] = useState(null); 
  const [copied, setCopied] = useState(false);
  const [fileBukti, setFileBukti] = useState(null); 
  const [previewBukti, setPreviewBukti] = useState(null); 

  // State Modal Notifikasi (Sukses/Gagal)
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  
  // State Modal Konfirmasi (Pengganti Alert Browser)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const userName = localStorage.getItem('userName') || 'Penghuni';
  const userId = localStorage.getItem('userId');

  const bankList = [
    { id: 'bca', name: 'BCA', number: '8210-1234-5678', holder: 'DYKAYA KOST', color: 'from-blue-600 to-blue-800' },
    { id: 'bri', name: 'BRI', number: '0021-01-000001-30-0', holder: 'IBU KOST', color: 'from-blue-500 to-indigo-600' },
    { id: 'dana', name: 'DANA', number: '0812-3456-7890', holder: 'DYKAYA', color: 'from-sky-400 to-blue-500' },
  ];

  const fetchData = () => {
    fetch(`http://localhost:3000/api/my-bill/${userId}`)
        .then(res => res.json())
        .then(result => { 
            if(result.status === "Found") setBill(result.data); 
            setLoading(false); 
        })
        .catch(() => setLoading(false));
  };

  useEffect(() => { if (!userId) navigate('/login'); else fetchData(); }, []);
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setFileBukti(file);
        setPreviewBukti(URL.createObjectURL(file)); 
    }
  };

  // 1. TAHAP PENGECEKAN (Trigger Modal Konfirmasi)
  const handleCekBayar = () => {
    if(!selectedBank) return setModal({ isOpen: true, type: 'warning', title: 'Pilih Bank', message: 'Silakan pilih metode pembayaran dulu.' });
    if(!fileBukti) return setModal({ isOpen: true, type: 'warning', title: 'Bukti Kosong', message: 'Wajib upload bukti transfer ya!' });
    
    // Buka Modal Konfirmasi Keren
    setIsConfirmOpen(true);
  };

  // 2. TAHAP EKSEKUSI (Jalan kalau user klik YA di Modal)
  const processPayment = async () => {
    setIsConfirmOpen(false); // Tutup modal konfirmasi
    
    try {
        const base64Img = await convertToBase64(fileBukti);
        const res = await fetch(`http://localhost:3000/api/transactions/${bill.trans_id}`, {
            method: 'PUT', 
            headers: {'Content-Type':'application/json'}, 
            body: JSON.stringify({ 
                status: 'verification',
                bukti_img: base64Img 
            })
        });
        const json = await res.json();
        if(json.status === 'Success') { 
            setModal({ isOpen: true, type: 'success', title: 'Berhasil Dikirim!', message: 'Admin akan mengecek bukti transfer Anda.' });
            fetchData(); 
        }
    } catch(err) { alert("Error upload"); }
  };

  const kirimKeluhan = async (e) => {
    e.preventDefault();
    if(!judulKeluhan || !isiKeluhan) { setModal({ isOpen: true, type: 'warning', title: 'Form Belum Lengkap', message: 'Isi semua data.' }); return; }
    try {
        const res = await fetch('http://localhost:3000/api/complaints', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ user_id: userId, judul: judulKeluhan, isi: isiKeluhan }) });
        const result = await res.json(); 
        if(result.status === "Success") { setModal({ isOpen: true, type: 'success', title: 'Terkirim!', message: 'Admin akan mengecek.' }); setJudulKeluhan(''); setIsiKeluhan(''); } 
        else { setModal({ isOpen: true, type: 'error', title: 'Gagal', message: result.message }); }
    } catch(err) { setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Koneksi error.' }); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold animate-pulse">Memuat Data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <div className="bg-slate-900 h-64 w-full absolute top-0 left-0 z-0 rounded-b-[3rem] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-3xl mx-auto px-6 relative z-10 pt-8">
        <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate('/')} className="flex items-center text-slate-300 hover:text-white gap-2 font-medium text-sm transition-all hover:-translate-x-1">
                <ArrowLeft size={18} /> Kembali
            </button>
            <button onClick={handleLogout} className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white/20 transition border border-white/10">
                <LogOut size={16} /> Logout
            </button>
        </div>

        <div className="text-white mb-10">
            <h1 className="text-3xl font-extrabold mb-1 tracking-tight">Halo, {userName} 👋</h1>
            <p className="text-slate-300 text-sm">Selamat datang di dashboard penghuni.</p>
        </div>

        {bill ? (
            <div className="space-y-8">
                <div className={`bg-white rounded-[2rem] p-1 shadow-xl relative overflow-hidden transition-all duration-500 ${bill.status_verifikasi === 'approved' ? 'shadow-emerald-900/10' : 'shadow-blue-900/10'}`}>
                    <div className="bg-white rounded-[1.8rem] p-6 md:p-8 h-full relative z-10">
                        {bill.status_verifikasi === 'waiting_payment' && (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-start mb-6">
                                    <div><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border border-blue-200">Menunggu Pembayaran</span><h2 className="text-2xl font-bold mt-2 text-slate-900">Selesaikan Pembayaran</h2></div>
                                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><CreditCard size={28}/></div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mb-6">{bankList.map((bank) => (<button key={bank.id} onClick={() => setSelectedBank(bank)} className={`relative p-3 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${selectedBank?.id === bank.id ? 'border-blue-600 bg-blue-50/50 scale-105 shadow-lg shadow-blue-100' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'}`}><div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[10px] shadow-md bg-gradient-to-br ${bank.color}`}>{bank.name}</div><span className={`text-xs font-bold ${selectedBank?.id === bank.id ? 'text-blue-700' : 'text-slate-500'}`}>{bank.name}</span>{selectedBank?.id === bank.id && <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1"><Check size={12}/></div>}</button>))}</div>
                                {selectedBank && (<div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 animate-slide-up"><div className="flex justify-between items-center mb-1"><span className="text-xs text-slate-500 font-bold uppercase">No. Rekening</span><span className="text-xs text-slate-400">Bank {selectedBank.name}</span></div><div className="flex justify-between items-center mb-3"><span className="font-mono text-xl font-bold text-slate-800 tracking-wider">{selectedBank.number}</span><button onClick={() => handleCopy(selectedBank.number)} className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition">{copied ? <Check size={18}/> : <Copy size={18}/>}</button></div><div className="h-px w-full bg-slate-200 my-3"></div><div className="flex justify-between items-center"><span className="text-sm text-slate-500">Total Tagihan</span><span className="text-lg font-bold text-blue-600">Rp {parseInt(bill.harga_bulanan).toLocaleString()}</span></div></div>)}
                                {selectedBank && (<div className="mb-6 animate-slide-up"><label className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-50 group ${fileBukti ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300'}`}><input type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>{previewBukti ? (<><img src={previewBukti} alt="Preview" className="h-32 rounded-lg shadow-sm object-cover mb-2"/><span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={14}/> Foto Terpilih</span></>) : (<><div className="p-3 bg-slate-100 rounded-full mb-2 group-hover:scale-110 transition-transform"><Upload size={24} className="text-slate-400"/></div><span className="text-sm font-bold text-slate-600">Upload Bukti Transfer</span><span className="text-xs text-slate-400">Klik untuk pilih gambar</span></>)}</label></div>)}
                                
                                {/* TOMBOL BAYAR SEKARANG MANGGIL FUNGSI CEK DULU */}
                                <button onClick={handleCekBayar} disabled={!selectedBank || !fileBukti} className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${selectedBank && fileBukti ? 'bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:shadow-2xl hover:scale-[1.02]' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}><Send size={20}/> Konfirmasi Pembayaran</button>
                            </div>
                        )}
                        {bill.status_verifikasi === 'verification' && (<div className="text-center py-8"><div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6 relative"><Clock size={40} className="text-purple-600 animate-pulse"/><div className="absolute inset-0 border-4 border-purple-100 rounded-full animate-ping opacity-20"></div></div><h2 className="text-2xl font-bold text-slate-900 mb-2">Sedang Diverifikasi</h2><p className="text-slate-500 max-w-xs mx-auto leading-relaxed">Admin sedang mengecek mutasi bank. Mohon tunggu sebentar, biasanya cuma 10-20 menit kok.</p></div>)}
                        {bill.status_verifikasi === 'pending' && (<div className="text-center py-8"><div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} className="text-amber-500"/></div><h2 className="text-2xl font-bold text-slate-900 mb-2">Menunggu Konfirmasi</h2><p className="text-slate-500 max-w-xs mx-auto">Admin sedang mengecek ketersediaan kamar <strong>{bill.nomor_kamar}</strong> pilihanmu.</p></div>)}
                        {bill.status_verifikasi === 'approved' && (<div className={`relative rounded-3xl p-8 overflow-hidden text-white shadow-2xl transition-transform hover:scale-[1.01] duration-300 ${bill.sisa_hari < 0 ? 'bg-gradient-to-br from-rose-500 to-red-600' : 'bg-gradient-to-br from-slate-800 to-black'}`}><div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck size={120}/></div><div className="relative z-10 flex flex-col justify-between h-full min-h-[180px]"><div className="flex justify-between items-start"><div><p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Status Tagihan</p><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${bill.sisa_hari < 0 ? 'bg-red-200 animate-ping' : 'bg-emerald-400'}`}></div><span className="font-bold text-lg tracking-wide">{bill.sisa_hari < 0 ? 'TELAT BAYAR' : 'AKTIF'}</span></div></div><Calendar className="text-white/80"/></div><div><p className="text-white/60 text-xs font-bold uppercase mb-1">Jatuh Tempo</p><h2 className="text-3xl font-bold tracking-tight">{new Date(bill.jatuh_tempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</h2><p className={`mt-2 inline-block px-3 py-1 rounded-lg text-xs font-bold ${bill.sisa_hari < 0 ? 'bg-white text-red-600' : 'bg-white/20 text-white backdrop-blur-sm'}`}>{bill.sisa_hari < 0 ? `Telat ${Math.abs(bill.sisa_hari)} hari!` : `${bill.sisa_hari} hari lagi`}</p></div></div></div>)}
                    </div>
                </div>
                {/* INFO KAMAR & FORM KELUHAN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center"><div className="flex items-center gap-3 mb-4"><div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Home size={20}/></div><h3 className="font-bold text-slate-800">Detail Kamar</h3></div><div className="flex gap-4"><div className="flex-1 bg-slate-50 p-4 rounded-2xl"><p className="text-xs text-slate-400 font-bold uppercase">Nomor</p><p className="text-xl font-bold text-slate-900">{bill.nomor_kamar}</p></div><div className="flex-1 bg-slate-50 p-4 rounded-2xl"><p className="text-xs text-slate-400 font-bold uppercase">Tipe</p><p className="text-xl font-bold text-slate-900">{bill.tipe_kamar}</p></div></div></div>{bill.status_verifikasi === 'approved' && (<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"><div className="flex items-center gap-3 mb-4"><div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><Wrench size={20}/></div><h3 className="font-bold text-slate-800">Lapor Kerusakan</h3></div><form onSubmit={kirimKeluhan} className="space-y-3"><input type="text" placeholder="Judul (Misal: Lampu Mati)" className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-400 transition" value={judulKeluhan} onChange={e => setJudulKeluhan(e.target.value)} /><div className="flex gap-2"><input type="text" placeholder="Detail..." className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-amber-400 transition" value={isiKeluhan} onChange={e => setIsiKeluhan(e.target.value)}/><button type="submit" className="bg-amber-500 text-white px-4 rounded-xl hover:bg-amber-600 transition shadow-lg shadow-amber-500/30"><Send size={18}/></button></div></form></div>)}</div>
            </div>
        ) : (
            <div className="bg-white p-12 rounded-[2rem] text-center border border-slate-100 shadow-xl"><div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle className="w-10 h-10 text-slate-300"/></div><h3 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Tagihan</h3><p className="text-slate-500 text-sm">Kamu belum menyewa kamar apapun. Silakan booking dulu ya!</p></div>
        )}
      </div>

      {/* --- MODAL KONFIRMASI PEMBAYARAN (BARU & GANTENG) --- */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsConfirmOpen(false)}></div>
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center relative z-10 shadow-2xl animate-fade-in-up">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                    <HelpCircle size={32}/>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Sudah Transfer?</h3>
                <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                    Pastikan nominal dan nomor rekening <strong>{selectedBank?.name}</strong> sudah sesuai. Bukti yang dikirim tidak bisa diubah lagi.
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition">
                        Batal
                    </button>
                    <button onClick={processPayment} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition shadow-blue-500/30">
                        Ya, Kirim
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL NOTIFIKASI (SUKSES / GAGAL) */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setModal({...modal, isOpen: false})}></div>
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center relative z-10 shadow-2xl animate-fade-in-up">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${modal.type==='success'?'bg-emerald-100 text-emerald-600':modal.type==='error'?'bg-rose-100 text-rose-600':'bg-amber-100 text-amber-500'}`}>
                    {modal.type==='success'?<CheckCircle size={32}/>:modal.type==='error'?<XCircle size={32}/>:<AlertTriangle size={32}/>}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{modal.title}</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">{modal.message}</p>
                <button onClick={() => setModal({...modal, isOpen: false})} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition shadow-xl shadow-slate-900/20">Mengerti</button>
            </div>
        </div>
      )}
    </div>
  );
};
export default UserDashboard;