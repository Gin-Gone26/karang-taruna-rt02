const db = require('../config/db');

// 1. Ambil semua kegiatan beserta daftar foto galerinya
exports.getAllKegiatan = async (req, res) => {
  try {
    const { kategori } = req.query;
    let query = 'SELECT * FROM kegiatan';
    const params = [];

    if (kategori) {
      query += ' WHERE kategori = ?';
      params.push(kategori);
    }
    query += ' ORDER BY tanggal_acara DESC, id DESC';

    const [kegiatanRows] = await db.query(query, params);
    const [fotoRows] = await db.query('SELECT id, kegiatan_id, foto_url FROM kegiatan_foto ORDER BY id ASC');

    const hasil = kegiatanRows.map((k) => ({
      ...k,
      galeri: fotoRows.filter((f) => f.kegiatan_id === k.id)
    }));

    res.json({ status: 'success', data: hasil });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. Tambah kegiatan baru (multi-foto Cloudinary)
exports.createKegiatan = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { judul, tanggal_acara, deskripsi, kategori } = req.body;
    if (!judul || !tanggal_acara || !deskripsi) {
      return res.status(400).json({ status: 'fail', message: 'Judul, tanggal, dan deskripsi wajib diisi' });
    }

    await conn.beginTransaction();

    const files = req.files || [];
    const sampulUrl = files.length > 0 ? files[0].path : null;

    const [result] = await conn.query(
      'INSERT INTO kegiatan (judul, tanggal_acara, deskripsi, kategori, foto_url) VALUES (?, ?, ?, ?, ?)',
      [judul, tanggal_acara, deskripsi, kategori || 'dokumentasi', sampulUrl]
    );

    const kegiatanId = result.insertId;

    if (files.length > 0) {
      const values = files.map((f) => [kegiatanId, f.path]);
      await conn.query('INSERT INTO kegiatan_foto (kegiatan_id, foto_url) VALUES ?', [values]);
    }

    await conn.commit();
    res.status(201).json({
      status: 'success',
      message: 'Kegiatan & album foto berhasil ditambahkan',
      data: { id: kegiatanId }
    });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    conn.release();
  }
};

// 3. Edit kegiatan & tambah foto baru ke album
exports.updateKegiatan = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const { judul, tanggal_acara, deskripsi, kategori } = req.body;

    await conn.beginTransaction();

    const [lama] = await conn.query('SELECT foto_url FROM kegiatan WHERE id = ?', [id]);
    if (lama.length === 0) {
      await conn.rollback();
      return res.status(404).json({ status: 'fail', message: 'Kegiatan tidak ditemukan' });
    }

    const files = req.files || [];
    let sampulUrl = lama[0].foto_url;

    if (!sampulUrl && files.length > 0) {
      sampulUrl = files[0].path;
    }

    await conn.query(
      'UPDATE kegiatan SET judul = ?, tanggal_acara = ?, deskripsi = ?, kategori = ?, foto_url = ? WHERE id = ?',
      [judul, tanggal_acara, deskripsi, kategori, sampulUrl, id]
    );

    if (files.length > 0) {
      const values = files.map((f) => [id, f.path]);
      await conn.query('INSERT INTO kegiatan_foto (kegiatan_id, foto_url) VALUES ?', [values]);
    }

    await conn.commit();
    res.json({ status: 'success', message: 'Kegiatan & album foto berhasil diperbarui' });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    conn.release();
  }
};

// 4. Hapus 1 foto spesifik di dalam album galeri
exports.deleteFotoGaleri = async (req, res) => {
  try {
    const { fotoId } = req.params;
    const [rows] = await db.query('SELECT * FROM kegiatan_foto WHERE id = ?', [fotoId]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Foto tidak ditemukan' });
    }

    const foto = rows[0];
    await db.query('DELETE FROM kegiatan_foto WHERE id = ?', [fotoId]);

    const [keg] = await db.query('SELECT foto_url FROM kegiatan WHERE id = ?', [foto.kegiatan_id]);
    if (keg.length > 0 && keg[0].foto_url === foto.foto_url) {
      const [sisa] = await db.query(
        'SELECT foto_url FROM kegiatan_foto WHERE kegiatan_id = ? ORDER BY id ASC LIMIT 1',
        [foto.kegiatan_id]
      );
      const sampulBaru = sisa.length > 0 ? sisa[0].foto_url : null;
      await db.query('UPDATE kegiatan SET foto_url = ? WHERE id = ?', [sampulBaru, foto.kegiatan_id]);
    }

    res.json({ status: 'success', message: 'Foto berhasil dihapus dari album' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 5. Hapus kegiatan beserta seluruh foto di albumnya
exports.deleteKegiatan = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM kegiatan WHERE id = ?', [id]);
    res.json({ status: 'success', message: 'Kegiatan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};