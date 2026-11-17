const db = require('../config/db');

// Helper format WA 08... -> 628...
const formatNomorWA = (nomor) => {
  if (!nomor) return null;
  let bersih = nomor.replace(/\D/g, '');
  if (bersih.startsWith('0')) {
    bersih = '62' + bersih.slice(1);
  }
  return bersih;
};

// 1. Ambil statistik ringkas untuk publik (tanpa data pribadi)
exports.getStatistikAnggota = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        COUNT(*) AS total_aktif,
        SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) AS laki_laki,
        SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) AS perempuan
      FROM anggota 
      WHERE status_aktif = 'Aktif'
    `);
    res.json({ status: 'success', data: rows[0] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. Ambil semua data lengkap anggota (Khusus Admin)
exports.getAllAnggota = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM anggota ORDER BY nama ASC');
    res.json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. Tambah anggota baru
exports.createAnggota = async (req, res) => {
  try {
    const { nama, jenis_kelamin, alamat_rumah, no_wa, status_kesibukan, status_aktif } = req.body;

    if (!nama || !alamat_rumah) {
      return res.status(400).json({ status: 'fail', message: 'Nama dan blok/nomor rumah wajib diisi' });
    }

    const waFormatted = formatNomorWA(no_wa);

    const query = `
      INSERT INTO anggota (nama, jenis_kelamin, alamat_rumah, no_wa, status_kesibukan, status_aktif) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [
      nama,
      jenis_kelamin || 'L',
      alamat_rumah,
      waFormatted,
      status_kesibukan || 'Pelajar/Mahasiswa',
      status_aktif || 'Aktif'
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Data pemuda berhasil ditambahkan',
      data: { id: result.insertId, nama, jenis_kelamin, alamat_rumah, no_wa: waFormatted, status_kesibukan, status_aktif }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 4. Update data anggota
exports.updateAnggota = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, jenis_kelamin, alamat_rumah, no_wa, status_kesibukan, status_aktif } = req.body;
    const waFormatted = formatNomorWA(no_wa);

    const query = `
      UPDATE anggota 
      SET nama = ?, jenis_kelamin = ?, alamat_rumah = ?, no_wa = ?, status_kesibukan = ?, status_aktif = ?
      WHERE id = ?
    `;
    const [result] = await db.query(query, [
      nama,
      jenis_kelamin,
      alamat_rumah,
      waFormatted,
      status_kesibukan,
      status_aktif,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'fail', message: 'Data anggota tidak ditemukan' });
    }

    res.json({ status: 'success', message: 'Data anggota berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 5. Hapus anggota
exports.deleteAnggota = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM anggota WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'fail', message: 'Data anggota tidak ditemukan' });
    }

    res.json({ status: 'success', message: 'Data anggota berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};