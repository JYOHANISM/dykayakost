import React, { useState, useEffect } from 'react';
import { Home, Users, DollarSign, LogOut, CheckCircle, XCircle, Clock, UserCheck, Wallet, ArrowLeft, Trash2, Edit2, Wrench, PlusCircle, Printer, AlertTriangle, Calendar, Search, LayoutDashboard, Eye, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', id: null, title: '', message: '', data: null });
  const [newExpense, setNewExpense] = useState({ nama: '', biaya: '', tanggal: '' });
  
  const [newRoom, setNewRoom] = useState({ nomor_kamar: '', tipe_kamar: '', harga_bulanan: '', fasilitas: '', status: 'tersedia', foto_kamar: '' });
  const [editTipe, setEditTipe] = useState({ tipe_kamar_lama: '', tipe_kamar_baru: '', harga_bulanan: '', fasilitas: '', foto_kamar: '' });

  const fetchData = () => {
    fetch('/api/transactions').then(res=>res.json()).then(data=>setBookings(data)).catch(err => console.error(err));
    fetch('/api/complaints').then(res=>res.json()).then(data=>setComplaints(data)).catch(err => console.error(err));
    fetch('/api/expenses').then(res=>res.json()).then(data=>setExpenses(data)).catch(err => console.error(err));
    fetch('/api/rooms').then(res=>res.json()).then(data=>setRooms(data)).catch(err => console.error(err));
  };

  useEffect(() => { fetchData(); }, []);

  const openStatusModal = (id, status) => {
    let title = '', msg = '';
    if (status === 'waiting_payment') { title = 'Konfirmasi Ketersediaan?'; msg = 'User akan diminta melakukan pembayaran (WhatsApp).'; }
    else if (status === 'approved') { title = 'Terima Pembayaran?'; msg = 'Argo sewa akan DIMULAI dari sekarang.'; }
    else if (status === 'rejected') { title = 'Tolak Pesanan?'; msg = 'Pesanan akan dibatalkan permanen.'; }
    setModalConfig({ isOpen: true, type: status, id: id, title, message: msg, data: null });
  };

  const openProofModal = (imgData) => { setModalConfig({ isOpen: true, type: 'view_proof', id: null, title: 'Bukti Pembayaran', message: 'Cek keaslian bukti transfer ini.', data: imgData }); };
  const openDeleteModal = (id, nama) => { setModalConfig({ isOpen: true, type: 'delete', id: id, title: 'Hapus Data?', message: `Hapus data "${nama}"?`, data: null }); };
  const openExpenseModal = () => { setNewExpense({ nama: '', biaya: '', tanggal: '' }); setModalConfig({ isOpen: true, type: 'expense', id: null, title: 'Catat Pengeluaran', message: '', data: null }); };

  const openAddRoomModal = () => { setNewRoom({ nomor_kamar: '', tipe_kamar: '', harga_bulanan: '', fasilitas: '', status: 'tersedia', foto_kamar: '' }); setModalConfig({ isOpen: true, type: 'add_room', id: null, title: 'Tambah Kamar Baru', message: 'Masukkan detail kamar:', data: { isNewType: true } }); };
  
  const openEditRoomModal = (room) => { 
    setNewRoom(room); 
    setModalConfig({ isOpen: true, type: 'edit_room', id: room.id, title: `Edit Kamar ${room.nomor_kamar}`, message: 'Ubah detail kamar di bawah ini:', data: null }); 
  };
  
  const openDeleteRoomModal = (id, nomor) => { setModalConfig({ isOpen: true, type: 'delete_room', id: id, title: 'Hapus Kamar?', message: `Yakin ingin menghapus Kamar ${nomor}?`, data: null }); };
  
  const openEditTipeModal = (tipeLama, harga, fasilitas, foto) => {
      setEditTipe({ tipe_kamar_lama: tipeLama, tipe_kamar_baru: tipeLama, harga_bulanan: harga, fasilitas: fasilitas, foto_kamar: foto || '' });
      setModalConfig({ isOpen: true, type: 'edit_tipe', id: null, title: `Edit ${tipeLama}`, message: 'Perubahan ini akan diterapkan ke SEMUA kamar yang bertipe ini.', data: null });
  };

  const confirmAction = async () => {
    const { type, id } = modalConfig;
    if(type === 'view_proof') { setModalConfig({...modalConfig, isOpen: false}); return; }
    
    try {
        if (['approved', 'waiting_payment', 'rejected'].includes(type)) {
            await fetch(`/api/transactions/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status: type}) });
        } 
        // --- INI BAGIAN YANG DIGANTI/DIPERBAIKI ---
        else if (type === 'delete') {
            console.log("Menghapus Transaksi ID:", id); 
            await fetch(`/api/transactions/${id}`, { 
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
        } 
        // ------------------------------------------
        else if (type === 'expense') {
            await fetch('/api/expenses', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(newExpense) });
        } else if (type === 'add_room') {
            await fetch('/api/rooms', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(newRoom) });
        } else if (type === 'edit_room') {
            await fetch(`/api/rooms/${id}`, { 
                method: 'PUT', 
                headers: {'Content-Type':'application/json'}, 
                body: JSON.stringify({
                    nomor_kamar: newRoom.nomor_kamar,
                    tipe_kamar: newRoom.tipe_kamar,
                    harga_bulanan: newRoom.harga_bulanan,
                    fasilitas: newRoom.fasilitas,
                    status: newRoom.status
                }) 
            });
        } else if (type === 'delete_room') {
            await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
        } else if (type === 'edit_tipe') {
            await fetch('/api/rooms/update-tipe', { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(editTipe) });
        }

        // Tutup modal dan refresh data
        setModalConfig({ ...modalConfig, isOpen: false }); 
        fetchData();
    } catch (error) { 
        console.error("Error saat eksekusi aksi:", error);
        alert("Gagal memproses data. Cek koneksi server."); 
    }
  };

  const handleStatusComplaint = async (id, status) => { 
    await fetch(`/api/complaints/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({status}) }); 
    fetchData(); 
  };

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  const profit = bookings.filter(b => b.status_verifikasi === 'approved').reduce((t, i) => t + parseInt(i.harga_bulanan), 0) - expenses.reduce((t, i) => t + parseInt(i.biaya), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      <aside className="w-72 bg-slate-900 text-white hidden md:flex flex-col fixed h-full z-20 shadow-2xl">
        <div className="p-8 pb-4">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 tracking-tighter">DYKAYA ADMIN</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Management System</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[ { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'kamar', label: 'Data Kamar', icon: Home }, { id: 'penghuni', label: 'Data Penghuni', icon: Users }, { id: 'keluhan', label: 'Keluhan', icon: Wrench, count: complaints.filter(c=>c.status==='pending').length }, { id: 'keuangan', label: 'Keuangan', icon: DollarSign } ].map((menu) => (
            <button key={menu.id} onClick={() => setActiveTab(menu.id)} 
                className={`w-full flex items-center px-5 py-4 rounded-xl transition-all duration-200 group ${activeTab === menu.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <menu.icon size={20} className={`mr-3 ${activeTab === menu.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}/> 
                <span className="font-medium">{menu.label}</span>
                {menu.count > 0 && <span className="ml-auto bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{menu.count}</span>}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5">
            <button onClick={handleLogout} className="flex items-center text-slate-400 hover:text-rose-400 transition gap-2 text-sm font-bold w-full"><LogOut size={16}/> Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-8 md:ml-72 bg-slate-50 min-h-screen">
        <div className="flex justify-between items-center mb-10">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab} Overview</h2>
                <p className="text-slate-500 text-sm">Manajemen Kost Dykaya</p>
            </div>
            <button onClick={() => navigate('/')} className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition flex items-center gap-2"><ArrowLeft size={16}/> Web Utama</button>
        </div>

        {activeTab === 'dashboard' && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><UserCheck size={32}/></div>
                    <div><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Permintaan Baru</p><h3 className="text-3xl font-black text-slate-800">{bookings.filter(b => b.status_verifikasi === 'pending').length}</h3></div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center"><AlertTriangle size={32}/></div>
                    <div><p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Keluhan Aktif</p><h3 className="text-3xl font-black text-slate-800">{complaints.filter(c => c.status === 'pending').length}</h3></div>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-3xl shadow-lg text-white flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"><Wallet size={32}/></div>
                    <div><p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Profit Bersih</p><h3 className="text-3xl font-black">Rp {(profit/1000000).toFixed(1)}Jt</h3></div>
                </div>
             </div>
        )}

        {activeTab === 'kamar' && (
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Daftar Kamar</h3>
                        <p className="text-xs text-slate-500 mt-1">Gunakan tombol edit di tipe atau di nomor kamar.</p>
                    </div>
                    <button onClick={openAddRoomModal} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-md"><PlusCircle size={16}/> Kamar / Tipe Baru</button>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <tr><th className="p-6 w-1/3">Tipe & Detail</th><th className="p-6">Daftar Nomor Kamar & Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                        {Object.entries(rooms.reduce((acc, room) => {
                            if (!acc[room.tipe_kamar]) acc[room.tipe_kamar] = { harga: room.harga_bulanan, fasilitas: room.fasilitas, list: [] };
                            acc[room.tipe_kamar].list.push(room);
                            return acc;
                        }, {})).map(([tipe, data]) => (
                            <tr key={tipe} className="hover:bg-slate-50/80 transition duration-150 align-top">
                                <td className="p-6">
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold text-slate-800 text-xl tracking-tight">{tipe}</div>
                                        <button onClick={() => openEditTipeModal(tipe, data.harga, data.fasilitas, data.list[0]?.foto_kamar)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition" title="Edit Massal Tipe Ini">
                                            <Edit2 size={16}/>
                                        </button>
                                    </div>
                                    <div className="text-blue-600 font-bold mt-1">Rp {parseInt(data.harga).toLocaleString()} / bln</div>
                                    <div className="text-xs text-slate-500 mt-2 leading-relaxed">Fasilitas: {data.fasilitas}</div>
                                </td>
                                <td className="p-6">
                                    <div className="flex flex-wrap gap-3">
                                        {data.list.map(room => (
                                            <button key={room.id} onClick={() => openEditRoomModal(room)} 
                                                className={`relative group px-4 py-3 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all hover:-translate-y-1 hover:shadow-lg
                                                ${room.status === 'tersedia' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                                  room.status === 'terisi' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                                                  'bg-amber-50 border-amber-100 text-amber-700'}`}>
                                                <span className="text-lg font-black">{room.nomor_kamar}</span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/50 px-2 py-0.5 rounded-md">{room.status}</span>
                                                <div className="absolute -top-3 -right-3 bg-blue-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Edit2 size={12}/>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'penghuni' && (
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                        <tr><th className="p-6">Kamar</th><th className="p-6">Data Penghuni</th><th className="p-6">Status</th><th className="p-6 text-center">Aksi</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                        {bookings.map(item => {
                            let displayName = item.keterangan;
                            let displayPhone = "";
                            const match = item.keterangan?.match(/a\.n\s+(.*?)\s+\((.*?)\)/);
                            if (match) { displayName = match[1]; displayPhone = match[2]; }
                            return (
                                <tr key={item.id} className="hover:bg-slate-50/80 transition duration-150">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center">
                                                <span className="text-sm font-bold">{item.nomor_kamar}</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.tipe_kamar}</div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-lg font-bold text-slate-800">{displayName}</div>
                                        <div className="text-slate-500 text-xs font-medium">{displayPhone}</div>
                                    </td>
                                    <td className="p-6">
                                        {item.status_verifikasi === 'approved' ? (
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">Lunas ({item.sisa_hari} Hari)</span>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                                                item.status_verifikasi === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                item.status_verifikasi === 'verification' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                'bg-blue-100 text-blue-700 border-blue-200'
                                            }`}>
                                                {item.status_verifikasi}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-6 flex justify-center gap-2">
                                        {/* FIX: Tombol Konfirmasi Berdasarkan Status */}
                                        {item.status_verifikasi === 'pending' && (
                                            <button onClick={() => openStatusModal(item.id, 'waiting_payment')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md">Ada Kamar</button>
                                        )}
                                        
                                        {(item.status_verifikasi === 'verification' || item.status_verifikasi === 'waiting_payment') && (
                                            <>
                                                <button onClick={() => openProofModal(item.bukti_bayar)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"><Eye size={16}/></button>
                                                <button onClick={() => openStatusModal(item.id, 'approved')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-md">Terima</button>
                                            </>
                                        )}
                                        
                                        <button onClick={()=>openDeleteModal(item.id, item.keterangan)} className="p-2 bg-white border border-slate-200 text-rose-500 rounded-lg hover:bg-rose-50"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}

        {activeTab === 'keluhan' && (<div className="grid gap-4">{complaints.map(c => (<div key={c.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center"><div className="flex gap-4 items-start"><div className="p-3 bg-rose-50 text-rose-500 rounded-xl mt-1"><AlertTriangle size={20}/></div><div><h4 className="font-bold text-slate-800">{c.judul_keluhan}</h4><p className="text-sm text-slate-500 mt-1">{c.isi_keluhan}</p><div className="text-xs text-slate-400 mt-2 font-bold uppercase">{c.nama_lengkap} • Kamar {c.nomor_kamar}</div></div></div>{c.status !== 'selesai' ? (<button onClick={()=>handleStatusComplaint(c.id, 'selesai')} className="px-4 py-2 bg-emerald-50 text-emerald-600 font-bold text-sm rounded-xl hover:bg-emerald-100">Selesaikan</button>) : <span className="text-emerald-600 font-bold text-sm px-4 py-2 bg-emerald-50 rounded-xl">Selesai</span>}</div>))}</div>)}
        {activeTab === 'keuangan' && (<div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8"><div className="flex justify-between items-center mb-8"><h3 className="font-bold text-xl">Arus Kas</h3><div className="flex gap-2"><button onClick={openExpenseModal} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><PlusCircle size={16}/> Catat Pengeluaran</button><button onClick={()=>window.print()} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Printer size={16}/> Print</button></div></div><table className="w-full text-sm"><thead className="bg-slate-50 font-bold text-xs uppercase"><tr><th className="p-4 text-left">Tanggal</th><th className="p-4 text-left">Keterangan</th><th className="p-4 text-right">Nominal</th></tr></thead><tbody>{bookings.filter(b=>b.status_verifikasi==='approved').map(b=>(<tr key={'in-'+b.id}><td className="p-4">{new Date(b.tanggal_transaksi).toLocaleDateString()}</td><td className="p-4 font-medium">Sewa Kamar {b.nomor_kamar}</td><td className="p-4 text-right font-bold text-emerald-600">+ Rp {parseInt(b.harga_bulanan).toLocaleString()}</td></tr>))}{expenses.map(e=>(<tr key={'out-'+e.id} className="bg-rose-50/30"><td className="p-4">{new Date(e.tanggal_pengeluaran).toLocaleDateString()}</td><td className="p-4 font-medium text-rose-800">{e.nama_pengeluaran}</td><td className="p-4 text-right font-bold text-rose-600">- Rp {parseInt(e.biaya).toLocaleString()}</td></tr>))}</tbody></table></div>)}

        {modalConfig.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={()=>setModalConfig({...modalConfig, isOpen:false})}></div>
                <div className={`bg-white w-full ${modalConfig.type === 'view_proof' ? 'max-w-lg' : 'max-w-md'} rounded-[2rem] p-8 relative z-10 shadow-2xl`}>
                    <h3 className="text-xl font-bold mb-2 text-slate-900">{modalConfig.title}</h3>
                    <p className="mb-6 text-slate-500 text-sm">{modalConfig.message}</p>
                    
                    {modalConfig.type === 'view_proof' && (<div className="mb-6 bg-slate-100 rounded-xl overflow-hidden border">{modalConfig.data ? <img src={modalConfig.data} className="w-full h-auto object-contain"/> : <div className="p-8 text-center text-slate-400">Belum ada bukti upload.</div>}</div>)}
                    
                    {(modalConfig.type === 'add_room' || modalConfig.type === 'edit_room') && (
                        <div className="space-y-3 mb-6">
                            <label className="block text-xs font-bold text-slate-400 uppercase">Nomor Kamar</label>
                            <input className="w-full bg-slate-50 border-0 p-4 rounded-xl font-bold" value={newRoom.nomor_kamar} onChange={e=>setNewRoom({...newRoom, nomor_kamar: e.target.value})}/>
                            <label className="block text-xs font-bold text-slate-400 uppercase">Harga Bulanan</label>
                            <input type="number" className="w-full bg-slate-50 border-0 p-4 rounded-xl" value={newRoom.harga_bulanan} onChange={e=>setNewRoom({...newRoom, harga_bulanan: e.target.value})}/>
                            <label className="block text-xs font-bold text-slate-400 uppercase">Fasilitas</label>
                            <textarea className="w-full bg-slate-50 border-0 p-4 rounded-xl text-sm" value={newRoom.fasilitas} onChange={e=>setNewRoom({...newRoom, fasilitas: e.target.value})}></textarea>
                            <label className="block text-xs font-bold text-slate-400 uppercase">Status</label>
                            <select className="w-full bg-slate-50 border-0 p-4 rounded-xl" value={newRoom.status} onChange={e=>setNewRoom({...newRoom, status: e.target.value})}>
                                <option value="tersedia">Tersedia</option>
                                <option value="terisi">Terisi</option>
                                <option value="perbaikan">Sedang Perbaikan</option>
                            </select>
                        </div>
                    )}

                    {modalConfig.type === 'edit_tipe' && (
                        <div className="space-y-3 mb-6">
                            <label className="block text-xs font-bold text-slate-400 uppercase">Nama Tipe Kamar</label>
                            <input className="w-full bg-slate-50 border-0 p-4 rounded-xl font-bold" value={editTipe.tipe_kamar_baru} onChange={e=>setEditTipe({...editTipe, tipe_kamar_baru: e.target.value})}/>
                            <label className="block text-xs font-bold text-slate-400 uppercase">Harga (Bulk)</label>
                            <input type="number" className="w-full bg-slate-50 border-0 p-4 rounded-xl" value={editTipe.harga_bulanan} onChange={e=>setEditTipe({...editTipe, harga_bulanan: e.target.value})}/>
                            <label className="block text-xs font-bold text-slate-400 uppercase">Fasilitas (Bulk)</label>
                            <textarea className="w-full bg-slate-50 border-0 p-4 rounded-xl h-24" value={editTipe.fasilitas} onChange={e=>setEditTipe({...editTipe, fasilitas: e.target.value})}></textarea>
                        </div>
                    )}

                    {modalConfig.type === 'expense' && (
                        <div className="space-y-3 mb-6">
                            <input className="w-full bg-slate-50 border-0 p-4 rounded-xl" placeholder="Nama Pengeluaran" value={newExpense.nama} onChange={e=>setNewExpense({...newExpense, nama: e.target.value})}/>
                            <input type="number" className="w-full bg-slate-50 border-0 p-4 rounded-xl" placeholder="Biaya" value={newExpense.biaya} onChange={e=>setNewExpense({...newExpense, biaya: e.target.value})}/>
                            <input type="date" className="w-full bg-slate-50 border-0 p-4 rounded-xl" value={newExpense.tanggal} onChange={e=>setNewExpense({...newExpense, tanggal: e.target.value})}/>
                        </div>
                    )}

                    <div className="flex gap-3 mt-8">
                        <button onClick={()=>setModalConfig({...modalConfig, isOpen:false})} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold">Batal</button>
                        {modalConfig.type !== 'view_proof' && (
                            <button onClick={confirmAction} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg">Konfirmasi</button>
                        )}
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};
export default AdminDashboard;