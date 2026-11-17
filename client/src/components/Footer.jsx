import { Link } from 'react-router-dom';
import { Shield, MapPin, Phone, Wallet } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20 print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        {/* Kolom 1: Identitas */}
        <div>
          <div className="flex items-center gap-2.5 text-white mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-wide">KARANG TARUNA RT 02</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Organisasi kepemudaan wadah pengembangan generasi muda yang aktif, kreatif, solid, dan peduli terhadap kemajuan lingkungan RT 02.
          </p>
        </div>

        {/* Kolom 2: Navigasi Cepat */}
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Tautan Cepat</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-emerald-400 transition">Beranda & Pengumuman</Link></li>
            <li><Link to="/kas" className="hover:text-emerald-400 transition flex items-center gap-1.5"><Wallet className="w-3.5 h-3.5" /> Laporan Kas Transparan</Link></li>
            <li><Link to="/login" className="hover:text-emerald-400 transition">Akses Pengurus RT 02</Link></li>
          </ul>
        </div>

        {/* Kolom 3: Sekretariat */}
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Sekretariat Wilayah</h4>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Balai / Pos Ronda Lingkungan RT 02</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Layanan Informasi Warga & Pemuda</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800/80 py-5 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Karang Taruna Unit RT 02. Dikelola secara mandiri oleh Pemuda RT 02.
      </div>
    </footer>
  );
}