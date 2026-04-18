import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Home, AlertCircle, ArrowLeft, Wrench, Send, AlertTriangle, CreditCard, Copy, Check, Upload, Clock, HelpCircle, MessageCircle, History } from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // STATE BARU: Histori & Perpanjangan
  const [history, setHistory] = useState([]);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDurasi, setExtendDurasi] = useState(1);
  
  const [judulKeluhan, setJudulKeluhan] = useState('');
  const [isiKeluhan, setIsiKeluhan] = useState('');
  const [tanggalKeluhan, setTanggalKeluhan] = useState(new Date().toISOString().split('T')[0]);
  
  const [selectedBank, setSelectedBank] = useState(null); 
  const [copied, setCopied] = useState(false);
  const [fileBukti, setFileBukti] = useState(null); 
  const [previewBukti, setPreviewBukti] = useState(null); 

  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const userName = localStorage.getItem('userName') || 'Penghuni';
  const userId = localStorage.getItem('userId');

  const bankList = [
    { id: 'bca', name: 'BCA', number: '8210-1234-5678', holder: 'DYKAYA KOST', color: 'bg-blue-600' },
    { id: 'bri', name: 'BRI', number: '0021-01-000001-30-0', holder: 'IBU KOST', color: 'bg-blue-800' },
    { id: 'dana', name: 'DANA', number: '0812-3456-7890', holder: 'DYKAYA', color: 'bg-sky-500' },
  ];

  const fetchData = () => {
    // Tarik Tagihan Aktif
    fetch(`/api/my-bill/${userId}`)
        .then(res => res.json())
        .then(result => { 
            if(result.status === "Found") setBill(result.data); 
        });

    // Tarik Riwayat (History)
    fetch(`/api/history/${userId}`)
        .then(res => res.json())
        .then(hist => { 
            setHistory(hist); 
            setLoading(false); 
        })
        .catch(() => setLoading(false));
  };

  useEffect(() => { 
    const role = localStorage.getItem('userRole');
    if (!userId) navigate('/login'); 
    else if (role === 'admin') navigate('/admin');
    else fetchData(); 
  }, [userId, navigate]);

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

  const handleCekBayar = () => {
    if(!selectedBank) return setModal({ isOpen: true, type: 'warning', title: 'Pilih Bank', message: 'Silakan pilih metode pembayaran dulu.' });
    if(!fileBukti) return setModal({ isOpen: true, type: 'warning', title: 'Bukti Kosong', message: 'Wajib upload bukti transfer ya!' });
    setIsConfirmOpen(true);
  };

  const processPayment = async () => {
    setIsConfirmOpen(false);
    try {
        const base64Img = await convertToBase64(fileBukti);
        const res = await fetch(`/api/transactions/${bill.trans_id}`, {
            method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ status: 'verification', bukti_img: base64Img })
        });
        const json = await res.json();
        if(json.status === 'Success') { 
            setModal({ isOpen: true, type: 'success', title: 'Berhasil Dikirim!', message: 'Admin akan mengecek bukti transfer Anda.' });
            fetchData(); 
        }
    } catch(err) { 
        setModal({ isOpen: true, type: 'error', title: 'Gagal Upload', message: 'Koneksi error.' });
    }
  };

  // FUNGSI PERPANJANG SEWA
  const handleExtendRent = async () => {
    try {
        const response = await fetch('/api/extend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: userId,
                room_id: bill.room_id,
                durasi: extendDurasi,
                tipe_kamar: bill.tipe_kamar,
                nama: userName
            })
        });
        const json = await response.json();
        if(json.status === "Success") {
            setShowExtendModal(false);
            setModal({ isOpen: true, type: 'success', title: 'Tagihan Dibuat!', message: 'Silakan selesaikan pembayaran untuk perpanjangan kamar.' });
            fetchData(); // Reload UI
        }
    } catch(e) {
        setModal({ isOpen: true, type: 'error', title: 'Error Server', message: 'Gagal memproses perpanjangan.' });
    }
  };

  const kirimKeluhan = async (e) => {
    e.preventDefault();
    if(!judulKeluhan || !isiKeluhan || !tanggalKeluhan) return setModal({ isOpen: true, type: 'warning', title: 'Form Belum Lengkap', message: 'Isi semua data termasuk tanggal.' }); 
    try {
        const res = await fetch('/api/complaints', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ user_id: userId, judul: judulKeluhan, isi: isiKeluhan, tanggal: tanggalKeluhan }) });
        const result = await res.json(); 
        if(result.status === "Success") { 
            setModal({ isOpen: true, type: 'success', title: 'Terkirim!', message: 'Admin akan segera mengecek laporan kamu.' }); 
            setJudulKeluhan(''); setIsiKeluhan(''); 
        }
    } catch(err) { setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Koneksi server terputus.' }); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold animate-pulse">Memuat Data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24">
      <div className="bg-slate-900 h-64 w-full absolute top-0 left-0 z-0 rounded-b-[3rem] shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-3xl mx-auto px-6 relative z-10 pt-8">
        <div className="flex justify-between items-center mb-8">
            <button onClick={() => navigate('/')} className="flex items-center text-slate-300 hover:text-white gap-2 font-medium text-sm"><ArrowLeft size={18} /> Kembali</button>
            <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white/20 border border-white/10"><LogOut size={16} /> Logout</button>
        </div>

        <div className="text-white mb-10">
            <h1 className="text-3xl font-extrabold mb-1">Halo, {userName}</h1>
            <p className="text-slate-300 text-sm">Selamat datang di dashboard penghuni.</p>
        </div>

        {bill ? (
            <div className="space-y-8">
                {/* KARTU TAGIHAN AKTIF */}
                <div className="bg-white rounded-[2rem] p-1 shadow-xl relative overflow-hidden transition-all duration-500">
                    <div className="bg-white rounded-[1.8rem] p-6 md:p-8 h-full relative z-10">
                        
                        {/* STATE 1: WAITING PAYMENT */}
                        {bill.status_verifikasi === 'waiting_payment' && (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-start mb-6">
                                    <div><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-blue-200">Menunggu Pembayaran</span><h2 className="text-2xl font-bold mt-2 text-slate-900">Selesaikan Pembayaran</h2></div>
                                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><CreditCard size={28}/></div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {bankList.map((bank) => (
                                        <button key={bank.id} onClick={() => setSelectedBank(bank)} className={`relative p-3 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${selectedBank?.id === bank.id ? 'border-blue-600 bg-blue-50/50 scale-105 shadow-lg' : 'border-slate-100 bg-white'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${bank.color}`}>{bank.name}</div>
                                            <span className="text-xs font-bold text-slate-700">{bank.name}</span>
                                            {selectedBank?.id === bank.id && <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1"><Check size={12}/></div>}
                                        </button>
                                    ))}
                                </div>
                                {selectedBank && (
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
                                        <div className="flex justify-between items-center mb-3"><span className="font-mono text-xl font-bold text-slate-800">{selectedBank.number}</span><button onClick={() => handleCopy(selectedBank.number)} className="text-blue-600 p-2"><Copy size={18}/></button></div>
                                        <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Total Tagihan</span><span className="text-lg font-bold text-blue-600">Rp {parseInt(bill.harga_bulanan).toLocaleString()}</span></div>
                                    </div>
                                )}
                                {selectedBank && (
                                    <div className="mb-6"><label className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer ${fileBukti ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-300'}`}><input type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>{previewBukti ? <img src={previewBukti} className="h-32 rounded-lg object-cover mb-2"/> : <Upload size={24} className="text-slate-400 mb-2"/>}</label></div>
                                )}
                                <button onClick={handleCekBayar} disabled={!selectedBank || !fileBukti} className={`w-full py-4 rounded-xl font-bold text-lg text-center ${selectedBank && fileBukti ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>Konfirmasi Pembayaran</button>
                            </div>
                        )}

                        {/* STATE 2: VERIFICATION */}
                        {bill.status_verifikasi === 'verification' && (<div className="text-center py-8"><Clock size={40} className="text-purple-600 mx-auto mb-6"/><h2 className="text-2xl font-bold text-slate-900 mb-2">Sedang Diverifikasi</h2><p className="text-slate-500">Admin sedang mengecek bukti transfer Anda.</p></div>)}

                        {/* STATE 3: APPROVED / AKTIF */}
                        {bill.status_verifikasi === 'approved' && (
                            <div className={`relative rounded-3xl p-8 overflow-hidden text-white shadow-xl ${bill.sisa_hari < 0 ? 'bg-rose-600' : 'bg-slate-900'}`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                                <div className="relative z-10 min-h-[150px] flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Status Tagihan</p>
                                            <span className="font-bold text-lg tracking-wide">{bill.sisa_hari < 0 ? 'HABIS MASA SEWA' : 'AKTIF'}</span>
                                        </div>
                                        <Calendar className="text-white/40" size={24} />
                                    </div>
                                    <div className="mt-6">
                                        <p className="text-white/60 text-xs font-bold uppercase mb-1">Jatuh Tempo</p>
                                        <h2 className="text-3xl font-black">{new Date(bill.jatuh_tempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
                                        
                                        <div className="mt-4 flex flex-wrap items-center gap-3">
                                            <div className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 border border-white/10 text-white">
                                                <Clock size={12} className="mr-1.5" />
                                                {bill.sisa_hari < 0 ? `Telat ${Math.abs(bill.sisa_hari)} hari!` : `${bill.sisa_hari} hari lagi`}
                                            </div>
                                            {/* TOMBOL PERPANJANG MUNCUL KALAU SISA HARI <= 7 ATAU UDAH EXPIRED */}
                                            {bill.sisa_hari <= 7 && (
                                                <button onClick={() => setShowExtendModal(true)} className="px-4 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-200 transition shadow-lg">
                                                    Perpanjang Sewa
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* INFO KAMAR & KELUHAN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4"><Home size={20} className="text-blue-600"/><h3 className="font-bold text-slate-800">Detail Kamar</h3></div>
                        <div className="flex gap-4"><div className="flex-1 bg-slate-50 p-4 rounded-2xl"><p className="text-xs text-slate-400 font-bold">Nomor</p><p className="text-xl font-bold text-slate-900">{bill.nomor_kamar}</p></div><div className="flex-1 bg-slate-50 p-4 rounded-2xl"><p className="text-xs text-slate-400 font-bold">Tipe</p><p className="text-xl font-bold text-slate-900">{bill.tipe_kamar}</p></div></div>
                    </div>
                    
                    {bill.status_verifikasi === 'approved' && (
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-3 mb-4"><Wrench size={20} className="text-amber-500"/><h3 className="font-bold text-slate-800">Lapor Kerusakan</h3></div>
                            <form onSubmit={kirimKeluhan} className="space-y-3">
                                <div className="flex gap-2">
                                    <input type="date" className="w-1/3 bg-slate-50 border-0 rounded-xl px-4 py-3 text-xs" value={tanggalKeluhan} onChange={e => setTanggalKeluhan(e.target.value)} required />
                                    <input type="text" placeholder="Judul (Kipas Mati)" className="w-2/3 bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm" value={judulKeluhan} onChange={e => setJudulKeluhan(e.target.value)} required />
                                </div>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Detail keluhan..." className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm" value={isiKeluhan} onChange={e => setIsiKeluhan(e.target.value)} required />
                                    <button type="submit" className="bg-amber-500 text-white px-4 rounded-xl shadow-lg hover:bg-amber-600"><Send size={18}/></button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* TABEL RIWAYAT SEWA (HISTORY) */}
                {history.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <History size={20} className="text-blue-600"/>
                            <h3 className="font-bold text-slate-800">Riwayat Transaksi & Sewa</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="p-4 rounded-tl-xl">Tanggal</th>
                                        <th className="p-4">Jenis</th>
                                        <th className="p-4">Kamar</th>
                                        <th className="p-4">Durasi</th>
                                        <th className="p-4 rounded-tr-xl">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {history.map((h, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition">
                                            <td className="p-4 font-medium">{new Date(h.tanggal_transaksi || Date.now()).toLocaleDateString('id-ID')}</td>
                                            <td className="p-4 uppercase text-xs font-bold text-slate-500">{h.jenis_transaksi === 'perpanjangan' ? 'Perpanjang' : 'Baru'}</td>
                                            <td className="p-4 font-bold text-blue-600">{h.nomor_kamar}</td>
                                            <td className="p-4">{h.durasi_sewa} Bln</td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${h.status_verifikasi === 'approved' ? 'bg-emerald-100 text-emerald-700' : h.status_verifikasi === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {h.status_verifikasi}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="bg-white p-12 rounded-[2rem] text-center border border-slate-100 shadow-xl"><AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-6"/><h3 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Tagihan</h3><p className="text-slate-500 text-sm">Silakan booking kamar impianmu terlebih dahulu!</p></div>
        )}
      </div>

      {/* FLOATING WA BUTTON */}
      <a href="https://wa.me/6281234567890?text=Halo%20Admin%20Kost%20Dykaya,%20saya%20butuh%20bantuan." target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-600 transition z-40 flex items-center justify-center group">
        <MessageCircle size={28} />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all font-bold text-sm">Chat Admin</span>
      </a>

      {/* MODAL PERPANJANG SEWA */}
      {showExtendModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center animate-fade-in shadow-2xl">
                <h3 className="text-xl font-bold text-slate-900 mb-1">Perpanjang Sewa</h3>
                <p className="text-slate-500 mb-6 text-sm">Kamar {bill.nomor_kamar} - {bill.tipe_kamar}</p>
                
                <div className="text-left mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Pilih Durasi Perpanjangan</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none" value={extendDurasi} onChange={e=>setExtendDurasi(parseInt(e.target.value))}>
                        {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1} Bulan</option>)}
                    </select>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowExtendModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl">Batal</button>
                    <button onClick={handleExtendRent} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Lanjut Bayar</button>
                </div>
            </div>
        </div>
      )}

      {/* MODAL KONFIRMASI PEMBAYARAN */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl">
                <HelpCircle size={32} className="text-blue-600 mx-auto mb-6"/>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Sudah Transfer?</h3>
                <p className="text-slate-500 mb-8 text-sm">Pastikan nominal transfer sudah sesuai ya!</p>
                <div className="flex gap-3"><button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl">Batal</button><button onClick={processPayment} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">Ya, Kirim</button></div>
            </div>
        </div>
      )}

      {/* MODAL NOTIFIKASI UMUM */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center shadow-2xl">
                <h3 className="text-2xl font-bold text-slate-900 mb-2 pt-4">{modal.title}</h3>
                <p className="text-slate-500 mb-8 text-sm">{modal.message}</p>
                <button onClick={() => setModal({...modal, isOpen: false})} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl">Mengerti</button>
            </div>
        </div>
      )}
    </div>
  );
};
export default UserDashboard;