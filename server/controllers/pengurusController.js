const db = require('../config/db');

exports.getAllPengurus = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM pengurus ORDER BY urutan ASC, id ASC');
    res.json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.createPengurus = async (req, res) => {
  try {
    const { nama, jabatan, no_wa, urutan } = req.body;
    if (!nama || !jabatan || !no_wa) {
      return res.status(400).json({ status: 'fail', message: 'Nama, jabatan, dan nomor WA wajib diisi' });
    }

    let waClean = no_wa.replace(/[^0-9]/g, '');
    if (waClean.startsWith('0')) waClean = '62' + waClean.slice(1);

    const foto_url = req.file ? req.file.path : null;

    const [result] = await db.query(
      'INSERT INTO pengurus (nama, jabatan, no_wa, foto_url, urutan) VALUES (?, ?, ?, ?, ?)',
      [nama, jabatan, waClean, foto_url, urutan || 1]
    );

    res.status(201).json({ status: 'success', message: 'Pengurus berhasil ditambahkan', data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updatePengurus = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, jabatan, no_wa, urutan } = req.body;

    const [lama] = await db.query('SELECT foto_url FROM pengurus WHERE id = ?', [id]);
    if (lama.length === 0) {
      return res.status(404).json({ status: 'fail', message: 'Data pengurus tidak ditemukan' });
    }

    let waClean = no_wa.replace(/[^0-9]/g, '');
    if (waClean.startsWith('0')) waClean = '62' + waClean.slice(1);

    let foto_url = lama[0].foto_url;
    if (req.file) {
      foto_url = req.file.path;
    }

    await db.query(
      'UPDATE pengurus SET nama = ?, jabatan = ?, no_wa = ?, foto_url = ?, urutan = ? WHERE id = ?',
      [nama, jabatan, waClean, foto_url, urutan || 1, id]
    );

    res.json({ status: 'success', message: 'Data pengurus berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.deletePengurus = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM pengurus WHERE id = ?', [id]);
    res.json({ status: 'success', message: 'Data pengurus berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};