const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Register pengurus baru
exports.register = async (req, res) => {
  try {
    const { nama, username, password, jabatan, role } = req.body;
    if (!nama || !username || !password) {
      return res.status(400).json({ status: 'fail', message: 'Nama, username, dan password wajib diisi' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      'INSERT INTO users (nama, username, password_hash, jabatan, role) VALUES (?, ?, ?, ?, ?)',
      [nama, username, password_hash, jabatan || 'Pengurus', role || 'sekretaris']
    );

    res.status(201).json({
      status: 'success',
      message: 'Akun pengurus berhasil dibuat',
      data: { id: result.insertId, nama, username, jabatan, role: role || 'sekretaris' }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ status: 'fail', message: 'Username sudah dipakai' });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. Login pengurus
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ status: 'fail', message: 'Username atau password salah' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ status: 'fail', message: 'Username atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, jabatan: user.jabatan, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      status: 'success',
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        jabatan: user.jabatan,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. Ambil daftar akun pengurus (Khusus Ketua)
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nama, username, jabatan, role, created_at FROM users ORDER BY id ASC');
    res.json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 4. Hapus akun pengurus (Khusus Ketua, tidak bisa hapus diri sendiri)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (Number(id) === req.user.id) {
      return res.status(400).json({ status: 'fail', message: 'Tidak dapat menghapus akun sendiri yang sedang login' });
    }

    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'fail', message: 'Akun tidak ditemukan' });
    }

    res.json({ status: 'success', message: 'Akun pengurus berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 5. Update akun pengurus (Khusus Ketua — password opsional)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, username, password, jabatan, role } = req.body;

    if (!nama || !username) {
      return res.status(400).json({ status: 'fail', message: 'Nama dan username wajib diisi' });
    }

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      await db.query(
        'UPDATE users SET nama = ?, username = ?, password_hash = ?, jabatan = ?, role = ? WHERE id = ?',
        [nama, username, password_hash, jabatan, role, id]
      );
    } else {
      await db.query(
        'UPDATE users SET nama = ?, username = ?, jabatan = ?, role = ? WHERE id = ?',
        [nama, username, jabatan, role, id]
      );
    }

    res.json({ status: 'success', message: 'Akun pengurus berhasil diperbarui' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ status: 'fail', message: 'Username sudah dipakai akun lain' });
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};