const db = require('../config/db');

// 1. Ambil semua riwayat kas + ringkasan saldo
exports.getAllKas = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM kas_rt ORDER BY tanggal DESC, created_at DESC');

    // Hitung total masuk, keluar, dan saldo akhir
    let totalMasuk = 0;
    let totalKeluar = 0;

    rows.forEach((item) => {
      if (item.jenis === 'masuk') {
        totalMasuk += Number(item.nominal);
      } else if (item.jenis === 'keluar') {
        totalKeluar += Number(item.nominal);
      }
    });

    const saldoAkhir = totalMasuk - totalKeluar;

    res.json({
      status: 'success',
      ringkasan: {
        total_masuk: totalMasuk,
        total_keluar: totalKeluar,
        saldo_akhir: saldoAkhir
      },
      data: rows
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. Tambah catatan kas (masuk / keluar)
exports.createKas = async (req, res) => {
  try {
    const { tanggal, jenis, nominal, keterangan } = req.body;

    if (!tanggal || !jenis || !nominal || !keterangan) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tanggal, jenis (masuk/keluar), nominal, dan keterangan wajib diisi'
      });
    }

    const query = 'INSERT INTO kas_rt (tanggal, jenis, nominal, keterangan) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(query, [tanggal, jenis, nominal, keterangan]);

    res.status(201).json({
      status: 'success',
      message: 'Catatan kas berhasil disimpan',
      data: { id: result.insertId, tanggal, jenis, nominal, keterangan }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update catatan kas
exports.updateKas = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, jenis, nominal, keterangan } = req.body;

    const [result] = await db.query(
      'UPDATE kas_rt SET tanggal = ?, jenis = ?, nominal = ?, keterangan = ? WHERE id = ?',
      [tanggal, jenis, nominal, keterangan, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'fail', message: 'Catatan kas tidak ditemukan' });
    }

    res.json({ status: 'success', message: 'Catatan kas berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. Hapus catatan kas
exports.deleteKas = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM kas_rt WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'fail', message: 'Catatan kas tidak ditemukan' });
    }

    res.json({
      status: 'success',
      message: 'Catatan kas berhasil dihapus'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};