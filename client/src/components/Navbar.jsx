import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Wallet, LogIn, LayoutDashboard, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [menuOpen, setMenuOpen] = useState(false);

  // State Dark Mode (cek localStorage atau preferensi sistem)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMenuOpen(false);
    navigate('/login');
  };

  const scrollToSection = (id) => {
    setMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white border-b border-slate-800 shadow-lg print:hidden">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex justify-between items-center">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-950/50 group-hover:scale-105 transition">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base md:text-lg tracking-wide block leading-none">
              KARANG TARUNA
            </span>
            <span className="text-[11px] font-semibold tracking-widest text-amber-400 uppercase">
              Unit Lingkungan RT 02
            </span>
          </div>
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-300">
          <Link to="/" className="hover:text-white transition">Beranda</Link>
          <button onClick={() => scrollToSection('tentang')} className="hover:text-white transition cursor-pointer">Profil & Visi</button>
          <button onClick={() => scrollToSection('kegiatan')} className="hover:text-white transition cursor-pointer">Kegiatan</button>
          <button onClick={() => scrollToSection('pengurus')} className="hover:text-white transition cursor-pointer">Pengurus</button>
          <Link to="/kas" className="text-amber-400 hover:text-amber-300 transition flex items-center gap-1.5 font-semibold">
            <Wallet className="w-4 h-4" /> Transparansi Kas
          </Link>

          <div className="h-5 w-px bg-slate-700"></div>

          {/* Tombol Toggle Dark Mode */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 transition cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {token ? (
            <div className="flex items-center gap-2">
              <Link to="/admin" className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 font-semibold shadow-sm">
                <LayoutDashboard className="w-4 h-4" /> Panel Admin
              </Link>
              <button onClick={handleLogout} title="Keluar" className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-1.5">
              <LogIn className="w-4 h-4 text-emerald-400" /> Pengurus
            </Link>
          )}
        </div>

        {/* Tombol Mobile (Dark Mode + Hamburger) */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 cursor-pointer"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-slate-300" />}
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-slate-300 hover:text-white cursor-pointer">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Dropdown Menu Mobile */}
      {menuOpen && (
        <div className="md:hidden bg-slate-900 dark:bg-slate-950 border-t border-slate-800 px-4 py-4 space-y-3 text-sm">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block py-1.5 text-slate-200 hover:text-emerald-400">Beranda</Link>
          <button onClick={() => scrollToSection('tentang')} className="block py-1.5 text-slate-200 hover:text-emerald-400 w-full text-left">Profil & Visi</button>
          <button onClick={() => scrollToSection('kegiatan')} className="block py-1.5 text-slate-200 hover:text-emerald-400 w-full text-left">Kegiatan</button>
          <button onClick={() => scrollToSection('pengurus')} className="block py-1.5 text-slate-200 hover:text-emerald-400 w-full text-left">Pengurus</button>
          <Link to="/kas" onClick={() => setMenuOpen(false)} className="block py-1.5 text-amber-400 font-semibold">Transparansi Kas RT</Link>
          <div className="pt-2 border-t border-slate-800">
            {token ? (
              <div className="flex gap-2">
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-center font-semibold">Panel Admin</Link>
                <button onClick={handleLogout} className="px-4 py-2 bg-rose-950 text-rose-300 rounded-lg">Keluar</button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block w-full bg-slate-800 text-center py-2 rounded-lg text-white font-medium">Login Pengurus</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}