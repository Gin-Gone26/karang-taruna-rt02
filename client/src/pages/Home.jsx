import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Calendar,
  Megaphone,
  Image as ImageIcon,
  MessageCircle,
  Package,
  ArrowRight,
  Wallet,
  Target,
  Award,
  HeartHandshake,
  X
} from 'lucide-react';

export default function Home() {
  const [kegiatan, setKegiatan] = useState([]);
  const [pengurus, setPengurus] = useState([]);
  const [inventaris, setInventaris] = useState([]);
  const [statistik, setStatistik] = useState({ total_aktif: 0, laki_laki: 0, perempuan: 0 });
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [activeFoto, setActiveFoto] = useState('');
  const [infoTerbaru, setInfoTerbaru] = useState(null);

  useEffect(() => {
    fetchKegiatan();
  }, [filter]);

  useEffect(() => {
    api.get('/pengurus').then((res) => setPengurus(res.data.data)).catch(console.error);
    api.get('/inventaris').then((res) => setInventaris(res.data.data)).catch(console.error);
    api.get('/anggota/statistik').then((res) => {
      if (res.data.data) setStatistik(res.data.data);
    }).catch(console.error);
  }, []);

const fetchKegiatan = async () => {
    try {
      setLoading(true);
      const url = filter ? `/kegiatan?kategori=${filter}` : '/kegiatan';
      const res = await api.get(url);
      const listData = res.data.data;
      setKegiatan(listData);

      // Cek apakah ada pengumuman atau dokumentasi kegiatan baru (hanya saat filter = semua)
      if (!filter && listData.length > 0) {
        const terbaru = listData[0]; // Item paling baru (pengumuman maupun dokumentasi)
        const lastSeenId = Number(localStorage.getItem('last_seen_kegiatan_id') || 0);

        if (terbaru.id > lastSeenId) {
          setInfoTerbaru(terbaru);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menutup alert & menandai sudah dilihat
  const tutupAlertInfo = () => {
    if (infoTerbaru) {
      localStorage.setItem('last_seen_kegiatan_id', String(infoTerbaru.id));
    }
    setInfoTerbaru(null);
  };

  const buatLinkWA = (nomor, nama, jabatan) => {
    const pesan = encodeURIComponent(
      `Halo ${nama} (${jabatan} Karang Taruna RT 02), saya warga RT 02 ingin menanyakan/menyampaikan informasi...`
    );
    return `https://wa.me/${nomor}?text=${pesan}`;
  };

  const bukaDetailKegiatan = (item) => {
    setSelectedKegiatan(item);
    const fotoPertama =
      item.galeri && item.galeri.length > 0 ? item.galeri[0].foto_url : item.foto_url || '';
    setActiveFoto(fotoPertama);
  };

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{
            backgroundImage: `url('/images/hero-bg.jpg')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-emerald-950/75" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Portal Resmi Kepemudaan RT 02
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-5">
              Bersatu, Berkarya, dan Mengabdi untuk <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">Lingkungan RT 02</span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8">
              Wadah kolaborasi generasi muda RT 02 dalam kegiatan sosial, olahraga, gotong royong, serta pengelolaan informasi dan kas organisasi yang terbuka bagi seluruh warga.
            </p>

            <div className="flex flex-wrap gap-3.5">
              <a
                href="#kegiatan"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition"
              >
                Lihat Kegiatan <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/kas"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition"
              >
                <Wallet className="w-4 h-4 text-amber-400" /> Transparansi Kas RT
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KARTU STATISTIK MENGAMBANG */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/70 dark:shadow-slate-950/80 border border-slate-100 dark:border-slate-800 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
          <div className="text-center pt-2 md:pt-0">
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{statistik.total_aktif || 0}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Pemuda/i Aktif</div>
          </div>
          <div className="text-center pt-4 md:pt-0">
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{statistik.laki_laki || 0}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Anggota Putra</div>
          </div>
          <div className="text-center pt-4 md:pt-0">
            <div className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{statistik.perempuan || 0}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Anggota Putri</div>
          </div>
          <div className="text-center pt-4 md:pt-0">
            <div className="text-3xl font-extrabold text-amber-500 dark:text-amber-400">{kegiatan.length}</div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Agenda & Dokumentasi</div>
          </div>
        </div>
      </section>

      {/* 3. PROFIL & VISI MISI */}
      <section id="tentang" className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
              <img
                src="/images/tentang-kami.jpg"
                alt="Kebersamaan Pemuda RT 02"
                className="w-full h-80 md:h-96 object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -right-3 md:-right-5 bg-slate-900 dark:bg-slate-900 text-white p-5 rounded-2xl shadow-xl border border-slate-800 max-w-xs">
              <p className="text-amber-400 font-bold text-sm uppercase tracking-wider">Semboyan Kami</p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                "Aditya Karya Mahatva Yodha — Pejuang yang berkepribadian, berpengetahuan, dan terampil."
              </p>
            </div>
          </div>

          <div className="space-y-5 pt-4 md:pt-0">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full">
              Tentang Organisasi
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-snug">
              Membangun Solidaritas & Kreativitas Generasi Muda RT 02
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
              Karang Taruna Unit RT 02 hadir sebagai motor penggerak kegiatan sosial kemasyarakatan, menjaga kerukunan antarwarga, serta menjadi ruang tumbuh bagi potensi pemuda di lingkungan RT 02.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Sosial & Gotong Royong</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Tanggap terhadap kebersihan lingkungan, keamanan, serta aksi solidaritas warga.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Kepemudaan, Seni & Olahraga</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Menyelenggarakan peringatan hari besar nasional, turnamen, dan kegiatan positif pemuda.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Transparansi & Akuntabilitas</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Keterbukaan laporan keuangan kas dan inventaris perlengkapan kepada seluruh warga RT 02.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INFO & DOKUMENTASI KEGIATAN */}
      <section id="kegiatan" className="bg-slate-100/80 dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Kabar Wilayah</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Pengumuman & Dokumentasi Kegiatan
              </h2>
            </div>

            <div className="flex gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              {['', 'pengumuman', 'dokumentasi'].map((kat) => (
                <button
                  key={kat}
                  onClick={() => setFilter(kat)}
                  className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold capitalize cursor-pointer transition ${
                    filter === kat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {kat === '' ? 'Semua' : kat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-10">Memuat informasi kegiatan...</p>
          ) : kegiatan.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
              Belum ada pengumuman atau dokumentasi kegiatan pada kategori ini.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kegiatan.map((item) => (
                <div
                  key={item.id}
                  onClick={() => bukaDetailKegiatan(item)}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="relative h-52 bg-slate-800 overflow-hidden">
                      {item.foto_url ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL \vert{}\vert{} 'http://localhost:5000'}${item.foto_url}`}
                          alt={item.judul}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-slate-900 flex flex-col items-center justify-center text-emerald-200/70 p-4">
                          {item.kategori === 'pengumuman' ? (
                            <Megaphone className="w-10 h-10 mb-2 text-amber-400" />
                          ) : (
                            <ImageIcon className="w-10 h-10 mb-2 text-emerald-400" />
                          )}
                          <span className="text-xs font-medium uppercase tracking-wider">Karang Taruna RT 02</span>
                        </div>
                      )}

                      <span
                        className={`absolute top-3 left-3 text-[11px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1 ${
                          item.kategori === 'pengumuman'
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {item.kategori === 'pengumuman' ? (
                          <Megaphone className="w-3 h-3" />
                        ) : (
                          <ImageIcon className="w-3 h-3" />
                        )}
                        {item.kategori.toUpperCase()}
                      </span>

                      {item.galeri && item.galeri.length > 1 && (
                        <span className="absolute top-3 right-3 bg-slate-950/75 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-emerald-400" /> {item.galeri.length} Foto
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {new Date(item.tanggal_acara).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition line-clamp-2 mb-2">
                        {item.judul}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">{item.deskripsi}</p>
                    </div>
                  </div>

                  <div className="px-5 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <span>Baca selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. INVENTARIS KARANG TARUNA RT 02 */}
      {inventaris.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pt-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Fasilitas Warga</span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Inventaris Perlengkapan RT 02
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cek ketersediaan barang sebelum menghubungi pengurus untuk peminjaman.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 dark:bg-slate-800 text-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4">Nama Perlengkapan</th>
                  <th className="p-4">Jumlah</th>
                  <th className="p-4">Kondisi</th>
                  <th className="p-4">Status Ketersediaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {inventaris.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100">{inv.nama_barang}</div>
                      {Number(inv.sedang_dipinjam) > 0 && (
                        <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                          ({inv.sedang_dipinjam} unit sedang dipinjam warga)
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-200">{inv.jumlah} unit</td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{inv.kondisi}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          inv.jumlah > 0
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {inv.jumlah > 0 ? 'Tersedia' : 'Habis Dipinjam'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 6. STRUKTUR KEPENGURUSAN */}
      <section id="pengurus" className="max-w-6xl mx-auto px-4 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Struktur Organisasi</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Pengurus Inti Karang Taruna RT 02
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Hubungi pengurus secara langsung melalui WhatsApp untuk koordinasi kegiatan pemuda, peminjaman inventaris, maupun aspirasi warga.
          </p>
        </div>

        {pengurus.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
            Data pengurus inti belum ditambahkan oleh admin.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pengurus.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col items-center text-center group"
              >
                <div className="w-full h-20 bg-gradient-to-r from-slate-800 to-emerald-900 relative"></div>

                <div className="-mt-12 relative">
                  {p.foto_url ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL \vert{}\vert{} 'http://localhost:5000'}${p.foto_url}`}
                      alt={p.nama}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-3xl font-extrabold flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-md">
                      {p.nama.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="p-5 pt-3 flex-1 flex flex-col w-full">
                  <span className="inline-block mx-auto text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 px-3 py-1 rounded-full mb-2">
                    {p.jabatan}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-5">{p.nama}</h3>

                  <a
                    href={buatLinkWA(p.no_wa, p.nama, p.jabatan)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-auto bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <MessageCircle className="w-4 h-4" /> Hubungi via WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

{/* MODAL POPUP DETAIL KEGIATAN & ALBUM GALERI */}
   {selectedKegiatan && (
     <div
       onClick={() => setSelectedKegiatan(null)}
       className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
     >
       <div
         onClick={(e) => e.stopPropagation()}
         className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800"
       >
         {/* Foto Utama Aktif */}
         {activeFoto && (
           <div className="bg-slate-950 flex items-center justify-center">
             <img
               src={`${import.meta.env.VITE_API_URL \vert{}\vert{} 'http://localhost:5000'}${activeFoto}`}
               alt={selectedKegiatan.judul}
               className="w-full max-h-96 object-contain"
             />
           </div>
         )}

         {/* Grid Thumbnail Galeri (Jika lebih dari 1 foto) */}
         {selectedKegiatan.galeri && selectedKegiatan.galeri.length > 1 && (
           <div className="px-6 pt-4">
             <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
               Album Dokumentasi ({selectedKegiatan.galeri.length} Foto — klik untuk memperbesar)
             </p>
             <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
               {selectedKegiatan.galeri.map((f) => (
                 <button
                   key={f.id}
                   type="button"
                   onClick={() => setActiveFoto(f.foto_url)}
                   className={`rounded-lg overflow-hidden border-2 h-16 cursor-pointer transition ${
                     activeFoto === f.foto_url
                       ? 'border-emerald-500 scale-105 shadow-md'
                       : 'border-transparent opacity-70 hover:opacity-100'
                   }`}
                 >
                   <img
                     src={`${import.meta.env.VITE_API_URL \vert{}\vert{} 'http://localhost:5000'}${f.foto_url}`}
                     alt="Thumbnail"
                     className="w-full h-full object-cover"
                   />
                 </button>
               ))}
             </div>
           </div>
         )}

         <div className="p-6">
           <div className="flex items-center justify-between gap-2 mb-3">
             <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
               {selectedKegiatan.kategori}
             </span>
             <button
               onClick={() => setSelectedKegiatan(null)}
               className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
             >
               <X className="w-5 h-5" />
             </button>
           </div>

           <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
             <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
             {new Date(selectedKegiatan.tanggal_acara).toLocaleDateString('id-ID', {
               weekday: 'long',
               day: 'numeric',
               month: 'long',
               year: 'numeric'
             })}
           </div>

           <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-4">
             {selectedKegiatan.judul}
           </h3>
           <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
             {selectedKegiatan.deskripsi}
           </p>
         </div>
       </div>
     </div>
   )}

{/* FLOATING ALERT PENGUMUMAN & KEGIATAN BARU */}
      {infoTerbaru && (
        <div className="fixed bottom-5 right-5 left-5 sm:left-auto sm:max-w-md z-50">
          <div
            className={`bg-slate-900 dark:bg-slate-900 text-white rounded-2xl shadow-2xl border-2 p-4 flex items-start gap-3.5 ${
              infoTerbaru.kategori === 'pengumuman'
                ? 'border-amber-400/80'
                : 'border-emerald-500/80'
            }`}
          >
            {/* Ikon Dinamis sesuai Kategori */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-md ${
                infoTerbaru.kategori === 'pengumuman'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {infoTerbaru.kategori === 'pengumuman' ? (
                <Megaphone className="w-5 h-5" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-widest ${
                    infoTerbaru.kategori === 'pengumuman'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {infoTerbaru.kategori === 'pengumuman'
                    ? 'Pengumuman Baru RT 02'
                    : 'Dokumentasi Kegiatan Baru'}
                </span>
                <button
                  onClick={tutupAlertInfo}
                  title="Tutup notifikasi"
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-bold text-sm text-white line-clamp-1 mt-0.5">
                {infoTerbaru.judul}
              </h4>
              <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                {infoTerbaru.deskripsi}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => {
                    const item = infoTerbaru;
                    tutupAlertInfo();
                    bukaDetailKegiatan(item);
                  }}
                  className={`font-bold text-xs px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                    infoTerbaru.kategori === 'pengumuman'
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {infoTerbaru.kategori === 'pengumuman'
                    ? 'Baca Selengkapnya'
                    : 'Lihat Dokumentasi'}
                </button>
                <button
                  onClick={tutupAlertInfo}
                  className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1.5 cursor-pointer"
                >
                  Nanti saja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}