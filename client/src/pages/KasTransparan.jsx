import { useEffect, useState } from 'react';
import api from '../services/api';
import { ArrowDownCircle, ArrowUpCircle, Wallet, Printer } from 'lucide-react';

export default function KasTransparan() {
  const [dataKas, setDataKas] = useState([]);
  const [bulanFilter, setBulanFilter] = useState('');

  useEffect(() => {
    api.get('/kas').then((res) => {
      setDataKas(res.data.data);
    });
  }, []);

  const kasTersaring = bulanFilter
    ? dataKas.filter((item) => {
        const d = new Date(item.tanggal);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return ym === bulanFilter;
      })
    : dataKas;

  const ringkasan = kasTersaring.reduce(
    (acc, item) => {
      if (item.jenis === 'masuk') acc.total_masuk += Number(item.nominal);
      else acc.total_keluar += Number(item.nominal);
      acc.saldo_akhir = acc.total_masuk - acc.total_keluar;
      return acc;
    },
    { total_masuk: 0, total_keluar: 0, saldo_akhir: 0 }
  );

  const formatRupiah = (angka) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Kop Surat Khusus Saat Dicetak */}
      <div className="hidden print:block border-b-2 border-slate-800 pb-4 mb-6 text-center text-slate-900">
        <h2 className="text-xl font-bold uppercase">Karang Taruna RT 02</h2>
        <p className="text-sm text-slate-600">Laporan Transparansi Keuangan & Kas Pemuda</p>
        <p className="text-xs text-slate-500 mt-1">
          Periode: {bulanFilter ? bulanFilter : 'Semua Periode'} • Dicetak pada:{' '}
          {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Header Halaman */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Laporan Kas Transparan RT 02</h1>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={bulanFilter}
            onChange={(e) => setBulanFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
          />
          {bulanFilter && (
            <button
              onClick={() => setBulanFilter('')}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white underline px-2 cursor-pointer"
            >
              Reset
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer transition"
          >
            <Printer className="w-4 h-4" /> Cetak / Simpan PDF
          </button>
        </div>
      </div>

      {/* 3 Kartu Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 print:bg-white p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ArrowDownCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 print:hidden" /> Total Pemasukan
          </p>
          <p className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatRupiah(ringkasan.total_masuk)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 print:bg-white p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ArrowUpCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 print:hidden" /> Total Pengeluaran
          </p>
          <p className="text-xl md:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{formatRupiah(ringkasan.total_keluar)}</p>
        </div>
        <div className="bg-emerald-700 text-white print:bg-slate-100 print:text-slate-900 print:border print:border-slate-300 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-emerald-100 print:text-slate-600 flex items-center gap-1">
            <Wallet className="w-4 h-4 print:hidden" /> Saldo Kas
          </p>
          <p className="text-xl md:text-2xl font-bold mt-1">{formatRupiah(ringkasan.saldo_akhir)}</p>
        </div>
      </div>

      {/* Tabel Riwayat */}
      <div className="bg-white dark:bg-slate-900 print:bg-white rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 dark:bg-slate-800 print:bg-slate-100 text-slate-700 dark:text-slate-200 print:text-slate-800 text-sm">
            <tr>
              <th className="p-3.5">Tanggal</th>
              <th className="p-3.5">Keterangan</th>
              <th className="p-3.5">Jenis</th>
              <th className="p-3.5 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {kasTersaring.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-slate-500 dark:text-slate-400">
                  Tidak ada catatan transaksi kas pada periode ini.
                </td>
              </tr>
            ) : (
              kasTersaring.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="p-3.5 text-slate-600 dark:text-slate-400 print:text-slate-700">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                  <td className="p-3.5 font-medium text-slate-800 dark:text-slate-100 print:text-slate-900">{item.keterangan}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        item.jenis === 'masuk'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {item.jenis.toUpperCase()}
                    </span>
                  </td>
                  <td
                    className={`p-3.5 text-right font-semibold ${
                      item.jenis === 'masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {item.jenis === 'masuk' ? '+' : '-'} {formatRupiah(item.nominal)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Kolom Tanda Tangan Khusus Saat Dicetak */}
      <div className="hidden print:flex justify-between mt-12 pt-4 text-sm text-slate-700 px-8">
        <div className="text-center">
          <p>Mengetahui,</p>
          <p className="font-semibold">Ketua Karang Taruna RT 02</p>
          <div className="h-16"></div>
          <p>( ........................................ )</p>
        </div>
        <div className="text-center">
          <p>Dibuat oleh,</p>
          <p className="font-semibold">Bendahara Karang Taruna RT 02</p>
          <div className="h-16"></div>
          <p>( ........................................ )</p>
        </div>
      </div>
    </div>
  );
}