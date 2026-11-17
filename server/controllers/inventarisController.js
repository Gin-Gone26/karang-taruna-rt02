const db = require('../config/db');

// 1. Ambil semua barang inventaris (termasuk info jumlah yang sedang dipinjam)
exports.getAllInventaris = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        i.*,
        COALESCE((SELECT SUM(jumlah_pinjam) FROM peminjaman_inventaris WHERE inventaris_id = i.id AND status = 'Dipinjam'), 0) AS sedang_dipinjam
      FROM inventaris i
      ORDER BY i.nama_barang ASC
    `);
    res.json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. Tambah barang inventaris baru
exports.createInventaris = async (req, res) => {
  try {
    const { nama_barang, jumlah, kondisi, keterangan } = req.body;
    if (!nama_barang) {
      return res.status(400).json({ status: 'fail', message: 'Nama barang wajib diisi' });
    }

    const stok = Number(jumlah) || 1;
    const status_pinjam = stok > 0 ? 'Tersedia' : 'Habis Dipinjam';

    const [result] = await db.query(
      'INSERT INTO inventaris (nama_barang, jumlah, kondisi, status_pinjam, keterangan) VALUES (?, ?, ?, ?, ?)',
      [nama_barang, stok, kondisi || 'Baik', status_pinjam, keterangan || '']
    );

    res.status(201).json({
      status: 'success',
      message: 'Barang inventaris berhasil ditambahkan',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. Edit data master barang
exports.updateInventaris = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_barang, jumlah, kondisi, keterangan } = req.body;

    const stok = Number(jumlah) >= 0 ? Number(jumlah) : 0;
    const status_pinjam = stok > 0 ? 'Tersedia' : 'Habis Dipinjam';

    const [result] = await db.query(
      'UPDATE inventaris SET nama_barang = ?, jumlah = ?, kondisi = ?, status_pinjam = ?, keterangan = ? WHERE id = ?',
      [nama_barang, stok, kondisi, status_pinjam, keterangan || '', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'fail', message: 'Barang tidak ditemukan' });
    }

    res.json({ status: 'success', message: 'Data inventaris diperbarui' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 4. Hapus barang inventaris
exports.deleteInventaris = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM inventaris WHERE id = ?', [id]);
    res.json({ status: 'success', message: 'Barang inventaris berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 5. Ambil daftar riwayat peminjaman
exports.getAllPeminjaman = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, i.nama_barang 
      FROM peminjaman_inventaris p
      JOIN inventaris i ON p.inventaris_id = i.id
      ORDER BY FIELD(p.status, 'Dipinjam', 'Dikembalikan'), p.tanggal_pinjam DESC, p.id DESC
    `);
    res.json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 6. Catat peminjaman baru (Otomatis kurangi stok barang)
exports.pinjamBarang = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { inventaris_id, nama_peminjam, no_wa, jumlah_pinjam, tanggal_pinjam, keterangan } = req.body;
    const qty = Number(jumlah_pinjam);

    if (!inventaris_id || !nama_peminjam || !qty || qty <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Barang, nama peminjam, dan jumlah pinjam wajib diisi' });
    }

    await conn.beginTransaction();

    // Cek stok tersedia
    const [barangRows] = await conn.query('SELECT * FROM inventaris WHERE id = ? FOR UPDATE', [inventaris_id]);
    if (barangRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ status: 'fail', message: 'Barang tidak ditemukan' });
    }

    const barang = barangRows[0];
    if (barang.jumlah < qty) {
      await conn.rollback();
      return res.status(400).json({
        status: 'fail',
        message: `Stok tidak mencukupi! Sisa tersedia hanya ${barang.jumlah} unit.`
      });
    }

    // Format nomor WA jika diisi
    let waClean = (no_wa || '').replace(/[^0-9]/g, '');
    if (waClean.startsWith('0')) waClean = '62' + waClean.slice(1);

    // Simpan data peminjaman
    await conn.query(
      'INSERT INTO peminjaman_inventaris (inventaris_id, nama_peminjam, no_wa, jumlah_pinjam, tanggal_pinjam, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
      [inventaris_id, nama_peminjam, waClean, qty, tanggal_pinjam || new Date(), keterangan || '']
    );

    // Kurangi stok barang
    const sisaStok = barang.jumlah - qty;
    const statusBaru = sisaStok > 0 ? 'Tersedia' : 'Habis Dipinjam';
    await conn.query('UPDATE inventaris SET jumlah = ?, status_pinjam = ? WHERE id = ?', [
      sisaStok,
      statusBaru,
      inventaris_id
    ]);

    await conn.commit();
    res.status(201).json({ status: 'success', message: 'Peminjaman berhasil dicatat & stok dikurangi' });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    conn.release();
  }
};

// 7. Kembalikan barang (Otomatis tambah stok barang kembali)
exports.kembalikanBarang = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params; // ID transaksi peminjaman

    await conn.beginTransaction();

    const [pinjamRows] = await conn.query('SELECT * FROM peminjaman_inventaris WHERE id = ? FOR UPDATE', [id]);
    if (pinjamRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ status: 'fail', message: 'Data peminjaman tidak ditemukan' });
    }

    const pinjam = pinjamRows[0];
    if (pinjam.status === 'Dikembalikan') {
      await conn.rollback();
      return res.status(400).json({ status: 'fail', message: 'Barang ini sudah dikembalikan sebelumnya' });
    }

    // Tandai peminjaman sudah dikembalikan
    await conn.query(
      "UPDATE peminjaman_inventaris SET status = 'Dikembalikan', tanggal_kembali = CURDATE() WHERE id = ?",
      [id]
    );

    // Tambah stok barang kembali
    await conn.query(
      "UPDATE inventaris SET jumlah = jumlah + ?, status_pinjam = 'Tersedia' WHERE id = ?",
      [pinjam.jumlah_pinjam, pinjam.inventaris_id]
    );

    await conn.commit();
    res.json({ status: 'success', message: 'Barang berhasil dikembalikan & stok bertambah' });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    conn.release();
  }
};