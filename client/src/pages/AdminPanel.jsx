import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import * as XLSX from 'xlsx';
import {
  Trash2, PlusCircle, Image as ImageIcon, UserCheck, Pencil, X,
  Users, Search, MessageCircle, Package, Share2, KeyRound,
  RotateCcw, HandHelping, FileSpreadsheet
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getImageUrl = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${BASE_URL}${url}`;
};

// Kelas CSS seragam untuk input/select/textarea agar rapi di Mobile & Dark Mode
const inputClass =
  'w-full bg-slate-50 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition';

export default function AdminPanel() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const fotoPengurusRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'ketua';

  const [tab, setTab] = useState(role === 'bendahara' ? 'kas' : 'kegiatan');

  const [kegiatan, setKegiatan] = useState([]);
  const [kas, setKas] = useState([]);
  const [pengurus, setPengurus] = useState([]);
  const [anggota, setAnggota] = useState([]);
  const [inventaris, setInventaris] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [cariAnggota, setCariAnggota] = useState('');
  const [uploading, setUploading] = useState(false);

  // State ID yang sedang diedit
  const [editKegId, setEditKegId] = useState(null);
  const [editKasId, setEditKasId] = useState(null);
  const [editPengurusId, setEditPengurusId] = useState(null);
  const [editAnggotaId, setEditAnggotaId] = useState(null);
  const [editInvId, setEditInvId] = useState(null);
  const [editAkunId, setEditAkunId] = useState(null);

  // Form Kegiatan
  const [formKeg, setFormKeg] = useState({ judul: '', tanggal_acara: '', deskripsi: '', kategori: 'dokumentasi' });
  const [fotoFiles, setFotoFiles] = useState([]);
  const [galeriEdit, setGaleriEdit] = useState([]);

  // Form Kas
  const [formKas, setFormKas] = useState({ tanggal: '', jenis: 'masuk', nominal: '', keterangan: '' });

  // Form Pengurus
  const [formPengurus, setFormPengurus] = useState({ nama: '', jabatan: '', no_wa: '', urutan: 1 });
  const [fotoPengurus, setFotoPengurus] = useState(null);

  // Form Anggota Pemuda
  const [formAnggota, setFormAnggota] = useState({
    nama: '',
    jenis_kelamin: 'L',
    alamat_rumah: '',
    no_wa: '',
    status_kesibukan: 'Pelajar/Mahasiswa',
    status_aktif: 'Aktif'
  });

  // Form Inventaris
  const [formInv, setFormInv] = useState({
    nama_barang: '',
    jumlah: 1,
    kondisi: 'Baik',
    status_pinjam: 'Tersedia',
    keterangan: ''
  });

  const [peminjaman, setPeminjaman] = useState([]);
  const [formPinjam, setFormPinjam] = useState({
    inventaris_id: '',
    nama_peminjam: '',
    no_wa: '',
    jumlah_pinjam: 1,
    tanggal_pinjam: new Date().toISOString().split('T')[0],
    keterangan: ''
  });

  // Form Akun Login Pengurus
  const [formAkun, setFormAkun] = useState({
    nama: '',
    username: '',
    password: '',
    jabatan: '',
    role: 'bendahara'
  });

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const promises = [];

      if (role === 'ketua' || role === 'sekretaris') {
        promises.push(
          api.get('/kegiatan').then((r) => setKegiatan(Array.isArray(r.data?.data) ? r.data.data : [])),
          api.get('/pengurus').then((r) => setPengurus(Array.isArray(r.data?.data) ? r.data.data : [])),
          api.get('/anggota').then((r) => setAnggota(Array.isArray(r.data?.data) ? r.data.data : [])),
          api.get('/inventaris').then((r) => setInventaris(Array.isArray(r.data?.data) ? r.data.data : [])),
          api.get('/inventaris/peminjaman').then((r) => setPeminjaman(Array.isArray(r.data?.data) ? r.data.data : []))
        );
      }

      if (role === 'ketua' || role === 'bendahara') {
        promises.push(api.get('/kas').then((r) => setKas(Array.isArray(r.data?.data) ? r.data.data : [])));
      }

      if (role === 'ketua') {
        promises.push(api.get('/auth/users').then((r) => setUsersList(Array.isArray(r.data?.data) ? r.data.data : [])));
      }

      await Promise.all(promises);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    }
  };

  const toInputDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
  };

  const buatLinkShareWA = (item) => {
    const tanggal = new Date(item.tanggal_acara).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const linkWeb = `${window.location.origin}/#kegiatan`;

    const teksPesan =
      `*📢 ${item.kategori.toUpperCase()} KARANG TARUNA RT 02*\n\n` +
      `*${item.judul}*\n` +
      `🗓️ Waktu: ${tanggal}\n\n` +
      `${item.deskripsi}\n\n` +
      `🔗 *Selengkapnya di Portal RT 02:*\n${linkWeb}`;

    return `https://api.whatsapp.com/send?text=${encodeURIComponent(teksPesan)}`;
  };

  // --- EXPORT EXCEL: KAS RT 02 ---
  const exportExcelKas = () => {
    if (kas.length === 0) {
      alert('Belum ada data kas untuk diexport.');
      return;
    }

    let totalMasuk = 0;
    let totalKeluar = 0;

    const urutTanggal = [...kas].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    const rows = urutTanggal.map((item, index) => {
      const nom = Number(item.nominal);
      if (item.jenis === 'masuk') totalMasuk += nom;
      else totalKeluar += nom;

      return {
        No: index + 1,
        Tanggal: new Date(item.tanggal).toLocaleDateString('id-ID'),
        Keterangan: item.keterangan,
        Jenis: item.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
        'Pemasukan (Rp)': item.jenis === 'masuk' ? nom : 0,
        'Pengeluaran (Rp)': item.jenis === 'keluar' ? nom : 0
      };
    });

    rows.push({});
    rows.push({
      Keterangan: 'TOTAL PEMASUKAN & PENGELUARAN',
      'Pemasukan (Rp)': totalMasuk,
      'Pengeluaran (Rp)': totalKeluar
    });
    rows.push({
      Keterangan: 'SALDO AKHIR KAS RT 02',
      'Pemasukan (Rp)': totalMasuk - totalKeluar
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 14 },
      { wch: 38 },
      { wch: 15 },
      { wch: 18 },
      { wch: 18 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Kas RT 02');

    const tglFile = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Laporan_Kas_Karang_Taruna_RT02_${tglFile}.xlsx`);
  };

  // --- EXPORT EXCEL: DATA PEMUDA RT 02 ---
  const exportExcelPemuda = () => {
    if (anggota.length === 0) {
      alert('Belum ada data pemuda untuk diexport.');
      return;
    }

    const rows = anggota.map((a, index) => ({
      No: index + 1,
      'Nama Lengkap': a.nama,
      'Jenis Kelamin': a.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
      'Alamat / Blok Rumah': a.alamat_rumah,
      'No. WhatsApp': a.no_wa ? `+${a.no_wa}` : '-',
      Kesibukan: a.status_kesibukan,
      'Status Keaktifan': a.status_aktif
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 28 },
      { wch: 15 },
      { wch: 25 },
      { wch: 18 },
      { wch: 22 },
      { wch: 18 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pemuda RT 02');

    const tglFile = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Data_Pemuda_Karang_Taruna_RT02_${tglFile}.xlsx`);
  };

  // --- HANDLER KEGIATAN ---
  const mulaiEditKegiatan = (item) => {
    setEditKegId(item.id);
    setFormKeg({
      judul: item.judul,
      tanggal_acara: toInputDate(item.tanggal_acara),
      deskripsi: item.deskripsi,
      kategori: item.kategori
    });
    setGaleriEdit(item.galeri || []);
    setFotoFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const batalEditKegiatan = () => {
    setEditKegId(null);
    setFormKeg({ judul: '', tanggal_acara: '', deskripsi: '', kategori: 'dokumentasi' });
    setFotoFiles([]);
    setGaleriEdit([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSimpanKegiatan = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('judul', formKeg.judul);
      formData.append('tanggal_acara', formKeg.tanggal_acara);
      formData.append('deskripsi', formKeg.deskripsi);
      formData.append('kategori', formKeg.kategori);

      for (let i = 0; i < fotoFiles.length; i++) {
        formData.append('fotos', fotoFiles[i]);
      }

      if (editKegId) {
        await api.put(`/kegiatan/${editKegId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/kegiatan', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      batalEditKegiatan();
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan kegiatan');
    } finally {
      setUploading(false);
    }
  };

  const handleHapusFotoAlbum = async (fotoId) => {
    if (confirm('Hapus foto ini dari album?')) {
      try {
        await api.delete(`/kegiatan/foto/${fotoId}`);
        setGaleriEdit((prev) => prev.filter((f) => f.id !== fotoId));
        loadAll();
      } catch (err) {
        alert('Gagal menghapus foto');
      }
    }
  };

  const handleHapusKegiatan = async (id) => {
    if (confirm('Hapus kegiatan ini beserta seluruh album fotonya?')) {
      await api.delete(`/kegiatan/${id}`);
      if (editKegId === id) batalEditKegiatan();
      loadAll();
    }
  };

  // --- HANDLER KAS ---
  const mulaiEditKas = (item) => {
    setEditKasId(item.id);
    setFormKas({
      tanggal: toInputDate(item.tanggal),
      jenis: item.jenis,
      nominal: item.nominal,
      keterangan: item.keterangan
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const batalEditKas = () => {
    setEditKasId(null);
    setFormKas({ tanggal: '', jenis: 'masuk', nominal: '', keterangan: '' });
  };

  const handleSimpanKas = async (e) => {
    e.preventDefault();
    if (editKasId) {
      await api.put(`/kas/${editKasId}`, formKas);
    } else {
      await api.post('/kas', formKas);
    }
    batalEditKas();
    loadAll();
  };

  const handleHapusKas = async (id) => {
    if (confirm('Hapus catatan kas ini?')) {
      await api.delete(`/kas/${id}`);
      if (editKasId === id) batalEditKas();
      loadAll();
    }
  };

  // --- HANDLER PENGURUS ---
  const mulaiEditPengurus = (p) => {
    setEditPengurusId(p.id);
    setFormPengurus({
      nama: p.nama,
      jabatan: p.jabatan,
      no_wa: p.no_wa,
      urutan: p.urutan
    });
    setFotoPengurus(null);
    if (fotoPengurusRef.current) fotoPengurusRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const batalEditPengurus = () => {
    setEditPengurusId(null);
    setFormPengurus({ nama: '', jabatan: '', no_wa: '', urutan: 1 });
    setFotoPengurus(null);
    if (fotoPengurusRef.current) fotoPengurusRef.current.value = '';
  };

  const handleSimpanPengurus = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('nama', formPengurus.nama);
      formData.append('jabatan', formPengurus.jabatan);
      formData.append('no_wa', formPengurus.no_wa);
      formData.append('urutan', formPengurus.urutan);
      if (fotoPengurus) formData.append('foto', fotoPengurus);

      if (editPengurusId) {
        await api.put(`/pengurus/${editPengurusId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/pengurus', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      batalEditPengurus();
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data pengurus');
    } finally {
      setUploading(false);
    }
  };

  const handleHapusPengurus = async (id) => {
    if (confirm('Hapus data pengurus ini?')) {
      await api.delete(`/pengurus/${id}`);
      if (editPengurusId === id) batalEditPengurus();
      loadAll();
    }
  };

  // --- HANDLER ANGGOTA PEMUDA ---
  const mulaiEditAnggota = (a) => {
    setEditAnggotaId(a.id);
    setFormAnggota({
      nama: a.nama,
      jenis_kelamin: a.jenis_kelamin,
      alamat_rumah: a.alamat_rumah,
      no_wa: a.no_wa || '',
      status_kesibukan: a.status_kesibukan,
      status_aktif: a.status_aktif
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const batalEditAnggota = () => {
    setEditAnggotaId(null);
    setFormAnggota({
      nama: '',
      jenis_kelamin: 'L',
      alamat_rumah: '',
      no_wa: '',
      status_kesibukan: 'Pelajar/Mahasiswa',
      status_aktif: 'Aktif'
    });
  };

  const handleSimpanAnggota = async (e) => {
    e.preventDefault();
    if (editAnggotaId) {
      await api.put(`/anggota/${editAnggotaId}`, formAnggota);
    } else {
      await api.post('/anggota', formAnggota);
    }
    batalEditAnggota();
    loadAll();
  };

  const handleHapusAnggota = async (id) => {
    if (confirm('Hapus data anggota ini?')) {
      await api.delete(`/anggota/${id}`);
      if (editAnggotaId === id) batalEditAnggota();
      loadAll();
    }
  };

  // --- HANDLER INVENTARIS & PEMINJAMAN ---
  const mulaiEditInv = (item) => {
    setEditInvId(item.id);
    setFormInv({
      nama_barang: item.nama_barang,
      jumlah: item.jumlah,
      kondisi: item.kondisi,
      keterangan: item.keterangan || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const batalEditInv = () => {
    setEditInvId(null);
    setFormInv({ nama_barang: '', jumlah: 1, kondisi: 'Baik', keterangan: '' });
  };

  const handleSimpanInv = async (e) => {
    e.preventDefault();
    if (editInvId) {
      await api.put(`/inventaris/${editInvId}`, formInv);
    } else {
      await api.post('/inventaris', formInv);
    }
    batalEditInv();
    loadAll();
  };

  const handleHapusInv = async (id) => {
    if (confirm('Hapus barang inventaris ini?')) {
      await api.delete(`/inventaris/${id}`);
      if (editInvId === id) batalEditInv();
      loadAll();
    }
  };

  const handlePinjamBarang = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inventaris/pinjam', formPinjam);
      setFormPinjam({
        inventaris_id: '',
        nama_peminjam: '',
        no_wa: '',
        jumlah_pinjam: 1,
        tanggal_pinjam: new Date().toISOString().split('T')[0],
        keterangan: ''
      });
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mencatat peminjaman');
    }
  };

  const handleKembalikanBarang = async (id, namaBarang, namaPeminjam) => {
    if (confirm(`Konfirmasi pengembalian ${namaBarang} dari ${namaPeminjam}? Stok akan otomatis bertambah.`)) {
      try {
        await api.put(`/inventaris/kembali/${id}`);
        loadAll();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal memproses pengembalian');
      }
    }
  };

  // --- HANDLER AKUN LOGIN PENGURUS (KHUSUS KETUA) ---
  const mulaiEditAkun = (u) => {
    setEditAkunId(u.id);
    setFormAkun({
      nama: u.nama,
      username: u.username,
      password: '',
      jabatan: u.jabatan,
      role: u.role
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const batalEditAkun = () => {
    setEditAkunId(null);
    setFormAkun({ nama: '', username: '', password: '', jabatan: '', role: 'bendahara' });
  };

  const handleSimpanAkun = async (e) => {
    e.preventDefault();
    try {
      if (editAkunId) {
        await api.put(`/auth/users/${editAkunId}`, formAkun);
      } else {
        await api.post('/auth/register', formAkun);
      }
      batalEditAkun();
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan akun');
    }
  };

  const handleHapusAkun = async (id) => {
    if (confirm('Hapus akses login akun ini?')) {
      try {
        await api.delete(`/auth/users/${id}`);
        if (editAkunId === id) batalEditAkun();
        loadAll();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus akun');
      }
    }
  };

  const anggotaTersaring = anggota.filter(
    (a) =>
      a.nama.toLowerCase().includes(cariAnggota.toLowerCase()) ||
      a.alamat_rumah.toLowerCase().includes(cariAnggota.toLowerCase())
  );

  const tabButtonClass = (active) =>
    `px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition ${
      active
        ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-700 dark:text-emerald-400'
        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Header Panel + Info Role */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Panel Pengurus RT 02
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
            <span>Masuk sebagai</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{user.nama}</span>
            <span>• Hak Akses:</span>
            <span className="uppercase font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950 px-2 py-0.5 rounded">
              {role}
            </span>
          </p>
        </div>

        {/* Navigasi Tab Sesuai Role (Scroll Horizontal di Mobile) */}
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800/90 p-1.5 rounded-xl overflow-x-auto max-w-full border border-slate-200 dark:border-slate-700/70">
          {(role === 'ketua' || role === 'sekretaris') && (
            <button onClick={() => setTab('kegiatan')} className={tabButtonClass(tab === 'kegiatan')}>
              Kegiatan
            </button>
          )}
          {(role === 'ketua' || role === 'bendahara') && (
            <button onClick={() => setTab('kas')} className={tabButtonClass(tab === 'kas')}>
              Kas RT
            </button>
          )}
          {(role === 'ketua' || role === 'sekretaris') && (
            <>
              <button onClick={() => setTab('pengurus')} className={tabButtonClass(tab === 'pengurus')}>
                Pengurus
              </button>
              <button onClick={() => setTab('anggota')} className={tabButtonClass(tab === 'anggota')}>
                Data Pemuda ({anggota.length})
              </button>
              <button onClick={() => setTab('inventaris')} className={tabButtonClass(tab === 'inventaris')}>
                Inventaris ({inventaris.length})
              </button>
            </>
          )}
          {role === 'ketua' && (
            <button onClick={() => setTab('akun')} className={tabButtonClass(tab === 'akun')}>
              Akun Login
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: KEGIATAN */}
      {tab === 'kegiatan' && (role === 'ketua' || role === 'sekretaris') && (
        <div className="grid md:grid-cols-3 gap-6">
          <form
            onSubmit={handleSimpanKegiatan}
            className={`p-5 rounded-2xl border space-y-3.5 h-fit transition ${
              editKegId
                ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                {editKegId ? (
                  <>
                    <Pencil className="w-4 h-4 text-amber-500" /> Edit Kegiatan
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 text-emerald-500" /> Tambah Kegiatan
                  </>
                )}
              </h2>
              {editKegId && (
                <button
                  type="button"
                  onClick={batalEditKegiatan}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Batal
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Judul Kegiatan
              </label>
              <input
                type="text"
                placeholder="Contoh: Kerja Bakti Minggu Pagi"
                required
                value={formKeg.judul}
                onChange={(e) => setFormKeg({ ...formKeg, judul: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Tanggal Pelaksanaan
                </label>
                <input
                  type="date"
                  required
                  value={formKeg.tanggal_acara}
                  onChange={(e) => setFormKeg({ ...formKeg, tanggal_acara: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Kategori
                </label>
                <select
                  value={formKeg.kategori}
                  onChange={(e) => setFormKeg({ ...formKeg, kategori: e.target.value })}
                  className={inputClass}
                >
                  <option value="dokumentasi">Dokumentasi</option>
                  <option value="pengumuman">Pengumuman</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                {editKegId ? 'Tambah Foto ke Album (Maks. 10)' : 'Upload Foto Album (Maks. 10 foto)'}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={(e) => setFotoFiles(Array.from(e.target.files))}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
              />
              {fotoFiles.length > 0 && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  {fotoFiles.length} foto baru siap diunggah
                </p>
              )}
            </div>

            {/* Preview & Hapus Foto Album Saat Mode Edit */}
            {editKegId && galeriEdit.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Foto di Album Saat Ini ({galeriEdit.length}):
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {galeriEdit.map((f) => (
                    <div key={f.id} className="relative group rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 h-16">
                      <img src={getImageUrl(f.foto_url)} alt="Album" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleHapusFotoAlbum(f.id)}
                        title="Hapus foto ini"
                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-md opacity-90 hover:opacity-100 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Deskripsi Kegiatan
              </label>
              <textarea
                rows="3"
                placeholder="Tuliskan detail waktu, tempat, dan rincian kegiatan..."
                required
                value={formKeg.deskripsi}
                onChange={(e) => setFormKeg({ ...formKeg, deskripsi: e.target.value })}
                className={inputClass}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className={`w-full text-white py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50 shadow-sm transition ${
                editKegId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {uploading ? 'Menyimpan...' : editKegId ? 'Simpan Perubahan' : 'Simpan Kegiatan'}
            </button>
          </form>

          <div className="md:col-span-2 space-y-3">
            {kegiatan.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
                Belum ada kegiatan atau pengumuman yang ditambahkan.
              </div>
            ) : (
              kegiatan.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start gap-3.5 transition ${
                    editKegId === item.id
                      ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {item.foto_url && (
                      <img
                        src={getImageUrl(item.foto_url)}
                        alt={item.judul}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {item.kategori} • {new Date(item.tanggal_acara).toLocaleDateString('id-ID')}
                      </span>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base leading-snug mt-0.5 break-words">
                        {item.judul}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                        {item.deskripsi}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-start shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 w-full sm:w-auto justify-end">
                    <a
                      href={buatLinkShareWA(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Bagikan ke Grup WhatsApp RT"
                      className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 p-2 rounded-lg transition"
                    >
                      <Share2 className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => mulaiEditKegiatan(item)}
                      title="Edit"
                      className="text-amber-600 dark:text-amber-400 hover:bg-amber-100/70 dark:hover:bg-amber-950/60 p-2 rounded-lg cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleHapusKegiatan(item.id)}
                      title="Hapus"
                      className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 p-2 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: KAS RT */}
      {tab === 'kas' && (role === 'ketua' || role === 'bendahara') && (
        <div className="grid md:grid-cols-3 gap-6">
          <form
            onSubmit={handleSimpanKas}
            className={`p-5 rounded-2xl border space-y-3.5 h-fit transition ${
              editKasId
                ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                {editKasId ? (
                  <>
                    <Pencil className="w-4 h-4 text-amber-500" /> Edit Transaksi Kas
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 text-emerald-500" /> Catat Transaksi Kas
                  </>
                )}
              </h2>
              {editKasId && (
                <button
                  type="button"
                  onClick={batalEditKas}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Batal
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={formKas.tanggal}
                onChange={(e) => setFormKas({ ...formKas, tanggal: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Jenis Transaksi</label>
              <select
                value={formKas.jenis}
                onChange={(e) => setFormKas({ ...formKas, jenis: e.target.value })}
                className={inputClass}
              >
                <option value="masuk">Pemasukan (+)</option>
                <option value="keluar">Pengeluaran (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nominal (Rp)</label>
              <input
                type="number"
                placeholder="Contoh: 50000"
                required
                value={formKas.nominal}
                onChange={(e) => setFormKas({ ...formKas, nominal: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Keterangan</label>
              <input
                type="text"
                placeholder="Misal: Iuran Bulanan Pemuda"
                required
                value={formKas.keterangan}
                onChange={(e) => setFormKas({ ...formKas, keterangan: e.target.value })}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              className={`w-full text-white py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition ${
                editKasId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {editKasId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
            </button>
          </form>

          <div className="md:col-span-2 space-y-3 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Riwayat Mutasi Kas ({kas.length})
              </span>
              <button
                type="button"
                onClick={exportExcelKas}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export Excel (.xlsx)
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[520px]">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs uppercase">
                  <tr>
                    <th className="p-3.5">Tanggal</th>
                    <th className="p-3.5">Keterangan</th>
                    <th className="p-3.5">Nominal</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {kas.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-500">
                        Belum ada transaksi kas tercatat.
                      </td>
                    </tr>
                  ) : (
                    kas.map((item) => (
                      <tr key={item.id} className={editKasId === item.id ? 'bg-amber-50 dark:bg-amber-950/20' : ''}>
                        <td className="p-3.5 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                          {new Date(item.tanggal).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-3.5 text-slate-800 dark:text-slate-100">{item.keterangan}</td>
                        <td
                          className={`p-3.5 font-semibold whitespace-nowrap ${
                            item.jenis === 'masuk'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {item.jenis === 'masuk' ? '+' : '-'} Rp {Number(item.nominal).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => mulaiEditKas(item)}
                            title="Edit"
                            className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 p-1.5 rounded-lg cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleHapusKas(item.id)}
                            title="Hapus"
                            className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 p-1.5 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PENGURUS */}
      {tab === 'pengurus' && (role === 'ketua' || role === 'sekretaris') && (
        <div className="grid md:grid-cols-3 gap-6">
          <form
            onSubmit={handleSimpanPengurus}
            className={`p-5 rounded-2xl border space-y-3.5 h-fit transition ${
              editPengurusId
                ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                {editPengurusId ? (
                  <>
                    <Pencil className="w-4 h-4 text-amber-500" /> Edit Pengurus
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-500" /> Tambah Pengurus
                  </>
                )}
              </h2>
              {editPengurusId && (
                <button
                  type="button"
                  onClick={batalEditPengurus}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Batal
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Nama Lengkap"
              required
              value={formPengurus.nama}
              onChange={(e) => setFormPengurus({ ...formPengurus, nama: e.target.value })}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Jabatan (misal: Ketua Karang Taruna)"
              required
              value={formPengurus.jabatan}
              onChange={(e) => setFormPengurus({ ...formPengurus, jabatan: e.target.value })}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="No. WhatsApp (0812...)"
              required
              value={formPengurus.no_wa}
              onChange={(e) => setFormPengurus({ ...formPengurus, no_wa: e.target.value })}
              className={inputClass}
            />
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Urutan Tampil (1 = Paling Awal)
              </label>
              <input
                type="number"
                min="1"
                value={formPengurus.urutan}
                onChange={(e) => setFormPengurus({ ...formPengurus, urutan: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                {editPengurusId ? 'Ganti Foto (Kosongkan jika tetap)' : 'Foto Profil (Opsional)'}
              </label>
              <input
                ref={fotoPengurusRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={(e) => setFotoPengurus(e.target.files[0])}
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs text-slate-600 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
              />
            </div>
            <button
              type="submit"
              disabled={uploading}
              className={`w-full text-white py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50 transition ${
                editPengurusId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {uploading ? 'Menyimpan...' : editPengurusId ? 'Simpan Perubahan' : 'Simpan Pengurus'}
            </button>
          </form>

          <div className="md:col-span-2 grid sm:grid-cols-2 gap-3 h-fit">
            {pengurus.length === 0 ? (
              <div className="sm:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
                Belum ada data pengurus inti yang ditambahkan.
              </div>
            ) : (
              pengurus.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                    editPengurusId === p.id
                      ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {p.foto_url ? (
                      <img
                        src={getImageUrl(p.foto_url)}
                        alt={p.nama}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">
                        {p.nama.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block truncate">
                        #{p.urutan} • {p.jabatan}
                      </span>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{p.nama}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">WA: +{p.no_wa}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => mulaiEditPengurus(p)}
                      title="Edit"
                      className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 p-2 rounded-lg cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleHapusPengurus(p.id)}
                      title="Hapus"
                      className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 p-2 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DATA PEMUDA RT 02 */}
      {tab === 'anggota' && (role === 'ketua' || role === 'sekretaris') && (
        <div className="grid md:grid-cols-3 gap-6">
          <form
            onSubmit={handleSimpanAnggota}
            className={`p-5 rounded-2xl border space-y-3.5 h-fit transition ${
              editAnggotaId
                ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                {editAnggotaId ? (
                  <>
                    <Pencil className="w-4 h-4 text-amber-500" /> Edit Data Pemuda
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 text-emerald-500" /> Tambah Data Pemuda
                  </>
                )}
              </h2>
              {editAnggotaId && (
                <button
                  type="button"
                  onClick={batalEditAnggota}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Batal
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Nama Lengkap"
              required
              value={formAnggota.nama}
              onChange={(e) => setFormAnggota({ ...formAnggota, nama: e.target.value })}
              className={inputClass}
            />

            <div className="grid grid-cols-2 gap-2">
              <select
                value={formAnggota.jenis_kelamin}
                onChange={(e) => setFormAnggota({ ...formAnggota, jenis_kelamin: e.target.value })}
                className={inputClass}
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
              <select
                value={formAnggota.status_aktif}
                onChange={(e) => setFormAnggota({ ...formAnggota, status_aktif: e.target.value })}
                className={inputClass}
              >
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Blok / No. Rumah (misal: Blok B No. 12)"
              required
              value={formAnggota.alamat_rumah}
              onChange={(e) => setFormAnggota({ ...formAnggota, alamat_rumah: e.target.value })}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="No. WhatsApp (0812...)"
              value={formAnggota.no_wa}
              onChange={(e) => setFormAnggota({ ...formAnggota, no_wa: e.target.value })}
              className={inputClass}
            />

            <select
              value={formAnggota.status_kesibukan}
              onChange={(e) => setFormAnggota({ ...formAnggota, status_kesibukan: e.target.value })}
              className={inputClass}
            >
              <option value="Pelajar/Mahasiswa">Pelajar / Mahasiswa</option>
              <option value="Bekerja">Bekerja</option>
              <option value="Wirausaha">Wirausaha</option>
              <option value="Lainnya">Lainnya</option>
            </select>

            <button
              type="submit"
              className={`w-full text-white py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition ${
                editAnggotaId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {editAnggotaId ? 'Simpan Perubahan' : 'Simpan Data Pemuda'}
            </button>
          </form>

          <div className="md:col-span-2 space-y-3 min-w-0">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama pemuda atau blok rumah..."
                  value={cariAnggota}
                  onChange={(e) => setCariAnggota(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={exportExcelPemuda}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer transition"
              >
                <FileSpreadsheet className="w-4 h-4" /> Export Excel (.xlsx)
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[520px]">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs uppercase">
                  <tr>
                    <th className="p-3.5">Nama & Rumah</th>
                    <th className="p-3.5">Kesibukan</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {anggotaTersaring.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-500">
                        Belum ada data pemuda RT 02.
                      </td>
                    </tr>
                  ) : (
                    anggotaTersaring.map((a) => (
                      <tr
                        key={a.id}
                        className={
                          editAnggotaId === a.id
                            ? 'bg-amber-50 dark:bg-amber-950/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }
                      >
                        <td className="p-3.5">
                          <div className="font-bold text-slate-800 dark:text-slate-100">
                            {a.nama} <span className="text-xs font-normal text-slate-400">({a.jenis_kelamin})</span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{a.alamat_rumah}</div>
                        </td>
                        <td className="p-3.5 text-xs text-slate-600 dark:text-slate-300">{a.status_kesibukan}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              a.status_aktif === 'Aktif'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {a.status_aktif}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                          {a.no_wa && (
                            <a
                              href={`https://wa.me/${a.no_wa}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat WA"
                              className="inline-block text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 p-1.5 rounded-lg"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => mulaiEditAnggota(a)}
                            title="Edit"
                            className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 p-1.5 rounded-lg cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleHapusAnggota(a.id)}
                            title="Hapus"
                            className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 p-1.5 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INVENTARIS & PEMINJAMAN RT 02 */}
      {tab === 'inventaris' && (role === 'ketua' || role === 'sekretaris') && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Form 1: Tambah / Edit Master Barang */}
            <form
              onSubmit={handleSimpanInv}
              className={`p-5 rounded-2xl border space-y-3.5 h-fit transition ${
                editInvId
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                  {editInvId ? (
                    <>
                      <Pencil className="w-4 h-4 text-amber-500" /> Edit Data Barang
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 text-emerald-500" /> Tambah Barang Inventaris
                    </>
                  )}
                </h2>
                {editInvId && (
                  <button
                    type="button"
                    onClick={batalEditInv}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Batal
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Nama Barang (misal: Kursi Plastik / Tenda)"
                required
                value={formInv.nama_barang}
                onChange={(e) => setFormInv({ ...formInv, nama_barang: e.target.value })}
                className={inputClass}
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Stok Tersedia (Unit)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formInv.jumlah}
                    onChange={(e) => setFormInv({ ...formInv, jumlah: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Kondisi</label>
                  <select
                    value={formInv.kondisi}
                    onChange={(e) => setFormInv({ ...formInv, kondisi: e.target.value })}
                    className={inputClass}
                  >
                    <option value="Baik">Baik</option>
                    <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>
              </div>

              <input
                type="text"
                placeholder="Catatan barang (opsional)"
                value={formInv.keterangan}
                onChange={(e) => setFormInv({ ...formInv, keterangan: e.target.value })}
                className={inputClass}
              />

              <button
                type="submit"
                className={`w-full text-white py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition ${
                  editInvId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {editInvId ? 'Simpan Perubahan Barang' : 'Simpan Barang Baru'}
              </button>
            </form>

            {/* Form 2: Catat Peminjaman Warga */}
            <form
              onSubmit={handlePinjamBarang}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 h-fit"
            >
              <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                <HandHelping className="w-4 h-4 text-amber-500" /> Catat Peminjaman Warga
              </h2>

              <select
                required
                value={formPinjam.inventaris_id}
                onChange={(e) => setFormPinjam({ ...formPinjam, inventaris_id: e.target.value })}
                className={inputClass}
              >
                <option value="">-- Pilih Barang yang Dipinjam --</option>
                {inventaris
                  .filter((b) => b.jumlah > 0)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nama_barang} (Sisa: {b.jumlah} unit)
                    </option>
                  ))}
              </select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nama Peminjam (misal: Pak Budi)"
                  required
                  value={formPinjam.nama_peminjam}
                  onChange={(e) => setFormPinjam({ ...formPinjam, nama_peminjam: e.target.value })}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="No. WA Peminjam (0812...)"
                  value={formPinjam.no_wa}
                  onChange={(e) => setFormPinjam({ ...formPinjam, no_wa: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Jumlah Dipinjam</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPinjam.jumlah_pinjam}
                    onChange={(e) => setFormPinjam({ ...formPinjam, jumlah_pinjam: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Tanggal Pinjam</label>
                  <input
                    type="date"
                    required
                    value={formPinjam.tanggal_pinjam}
                    onChange={(e) => setFormPinjam({ ...formPinjam, tanggal_pinjam: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <input
                type="text"
                placeholder="Keperluan (misal: Acara hajatan Blok C)"
                value={formPinjam.keterangan}
                onChange={(e) => setFormPinjam({ ...formPinjam, keterangan: e.target.value })}
                className={inputClass}
              />

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition"
              >
                Catat Pinjam (Kurangi Stok)
              </button>
            </form>
          </div>

          {/* TABEL 1: DAFTAR STOK INVENTARIS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-800 dark:text-slate-100">
              Daftar Stok Barang Inventaris
            </div>
            <table className="w-full text-left text-sm min-w-[540px]">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs uppercase">
                <tr>
                  <th className="p-3.5">Nama Barang</th>
                  <th className="p-3.5">Stok Tersedia</th>
                  <th className="p-3.5">Sedang Dipinjam</th>
                  <th className="p-3.5">Kondisi</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {inventaris.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-500">
                      Belum ada barang inventaris tercatat.
                    </td>
                  </tr>
                ) : (
                  inventaris.map((item) => (
                    <tr
                      key={item.id}
                      className={
                        editInvId === item.id
                          ? 'bg-amber-50 dark:bg-amber-950/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{item.nama_barang}</div>
                        {item.keterangan && <div className="text-xs text-slate-500">{item.keterangan}</div>}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`font-bold ${
                            item.jumlah > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {item.jumlah} unit
                        </span>
                      </td>
                      <td className="p-3.5 text-xs text-amber-600 dark:text-amber-400 font-semibold whitespace-nowrap">
                        {Number(item.sedang_dipinjam) > 0 ? `${item.sedang_dipinjam} unit` : '-'}
                      </td>
                      <td className="p-3.5 text-xs text-slate-600 dark:text-slate-300">{item.kondisi}</td>
                      <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => mulaiEditInv(item)}
                          title="Edit"
                          className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 p-1.5 rounded-lg cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleHapusInv(item.id)}
                          title="Hapus"
                          className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 p-1.5 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABEL 2: DAFTAR PEMINJAMAN & TOMBOL KEMBALIKAN */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-800 dark:text-slate-100">
              Riwayat & Status Peminjaman Warga
            </div>
            <table className="w-full text-left text-sm min-w-[580px]">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs uppercase">
                <tr>
                  <th className="p-3.5">Peminjam</th>
                  <th className="p-3.5">Barang & Jumlah</th>
                  <th className="p-3.5">Tgl Pinjam</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {peminjaman.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-500">
                      Belum ada riwayat peminjaman barang.
                    </td>
                  </tr>
                ) : (
                  peminjaman.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 dark:text-slate-100">{p.nama_peminjam}</div>
                        {p.keterangan && <div className="text-xs text-slate-500">{p.keterangan}</div>}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{p.nama_barang}</span>{' '}
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          ({p.jumlah_pinjam} unit)
                        </span>
                      </td>
                      <td className="p-3.5 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(p.tanggal_pinjam).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        {p.status === 'Dipinjam' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            Sedang Dipinjam
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                            Dikembalikan ({p.tanggal_kembali ? new Date(p.tanggal_kembali).toLocaleDateString('id-ID') : ''})
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {p.no_wa && (
                          <a
                            href={`https://wa.me/${p.no_wa}?text=${encodeURIComponent(`Halo ${p.nama_peminjam}, kami dari Pengurus Karang Taruna RT 02 ingin menanyakan terkait peminjaman ${p.nama_barang} (${p.jumlah_pinjam} unit)...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Hubungi Peminjam via WA"
                            className="inline-flex items-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 p-1.5 rounded-lg"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}
                        {p.status === 'Dipinjam' && (
                          <button
                            onClick={() => handleKembalikanBarang(p.id, p.nama_barang, p.nama_peminjam)}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Kembalikan
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: MANAJEMEN AKUN LOGIN (KHUSUS KETUA) */}
      {tab === 'akun' && role === 'ketua' && (
        <div className="grid md:grid-cols-3 gap-6">
          <form
            onSubmit={handleSimpanAkun}
            className={`p-5 rounded-2xl border space-y-3.5 h-fit transition ${
              editAkunId
                ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-sm">
                {editAkunId ? (
                  <>
                    <Pencil className="w-4 h-4 text-amber-500" /> Edit Akun Pengurus
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-emerald-500" /> Buat Akun Pengurus
                  </>
                )}
              </h2>
              {editAkunId && (
                <button
                  type="button"
                  onClick={batalEditAkun}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Batal
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Nama Pengurus"
              required
              value={formAkun.nama}
              onChange={(e) => setFormAkun({ ...formAkun, nama: e.target.value })}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Username Login"
              required
              value={formAkun.username}
              onChange={(e) => setFormAkun({ ...formAkun, username: e.target.value })}
              className={inputClass}
            />
            <input
              type="password"
              placeholder={editAkunId ? 'Password Baru (Kosongkan jika tetap)' : 'Password'}
              required={!editAkunId}
              value={formAkun.password}
              onChange={(e) => setFormAkun({ ...formAkun, password: e.target.value })}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Jabatan (misal: Bendahara 1)"
              required
              value={formAkun.jabatan}
              onChange={(e) => setFormAkun({ ...formAkun, jabatan: e.target.value })}
              className={inputClass}
            />
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Role / Hak Akses</label>
              <select
                value={formAkun.role}
                onChange={(e) => setFormAkun({ ...formAkun, role: e.target.value })}
                className={inputClass}
              >
                <option value="bendahara">Bendahara (Hanya Kas RT)</option>
                <option value="sekretaris">Sekretaris / Humas (Kegiatan, Pemuda, Inventaris)</option>
                <option value="ketua">Ketua (Akses Penuh)</option>
              </select>
            </div>
            <button
              type="submit"
              className={`w-full text-white py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition ${
                editAkunId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {editAkunId ? 'Simpan Perubahan' : 'Buat Akun Pengurus'}
            </button>
          </form>

          <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto h-fit">
            <table className="w-full text-left text-sm min-w-[480px]">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs uppercase">
                <tr>
                  <th className="p-3.5">Nama & Jabatan</th>
                  <th className="p-3.5">Username</th>
                  <th className="p-3.5">Role Akses</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {usersList.map((u) => (
                  <tr key={u.id} className={editAkunId === u.id ? 'bg-amber-50 dark:bg-amber-950/20' : ''}>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{u.nama}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{u.jabatan}</div>
                    </td>
                    <td className="p-3.5 font-mono text-xs text-slate-600 dark:text-slate-300">{u.username}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          u.role === 'ketua'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : u.role === 'bendahara'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => mulaiEditAkun(u)}
                        title="Edit Akun / Reset Password"
                        className="text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/60 p-1.5 rounded-lg cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {u.id !== user.id && (
                        <button
                          onClick={() => handleHapusAkun(u.id)}
                          title="Hapus Akun"
                          className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 p-1.5 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}