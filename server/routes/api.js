const express = require('express');
const router = express.Router();

const { verifyToken, cekRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const authController = require('../controllers/authController');
const kegiatanController = require('../controllers/kegiatanController');
const kasController = require('../controllers/kasController');
const pengurusController = require('../controllers/pengurusController');
const anggotaController = require('../controllers/anggotaController');
const inventarisController = require('../controllers/inventarisController');

// --- AUTH ---
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/users', verifyToken, cekRole(['ketua']), authController.getAllUsers);
router.delete('/users/:id', verifyToken, cekRole(['ketua']), authController.deleteUser);

// --- KEGIATAN & ALBUM GALERI ---
router.get('/kegiatan', kegiatanController.getAllKegiatan);
router.post('/kegiatan', verifyToken, cekRole(['ketua', 'sekretaris']), upload.array('foto', 10), kegiatanController.createKegiatan);
router.put('/kegiatan/:id', verifyToken, cekRole(['ketua', 'sekretaris']), upload.array('foto', 10), kegiatanController.updateKegiatan);
router.delete('/kegiatan/foto/:fotoId', verifyToken, cekRole(['ketua', 'sekretaris']), kegiatanController.deleteFotoGaleri);
router.delete('/kegiatan/:id', verifyToken, cekRole(['ketua', 'sekretaris']), kegiatanController.deleteKegiatan);

// --- KAS RT ---
router.get('/kas', kasController.getAllKas);
router.post('/kas', verifyToken, cekRole(['ketua', 'bendahara']), kasController.createKas);
router.put('/kas/:id', verifyToken, cekRole(['ketua', 'bendahara']), kasController.updateKas);
router.delete('/kas/:id', verifyToken, cekRole(['ketua', 'bendahara']), kasController.deleteKas);

// --- PENGURUS ---
router.get('/pengurus', pengurusController.getAllPengurus);
router.post('/pengurus', verifyToken, cekRole(['ketua']), upload.single('foto'), pengurusController.createPengurus);
router.put('/pengurus/:id', verifyToken, cekRole(['ketua']), upload.single('foto'), pengurusController.updatePengurus);
router.delete('/pengurus/:id', verifyToken, cekRole(['ketua']), pengurusController.deletePengurus);

// --- ANGGOTA PEMUDA ---
router.get('/anggota', anggotaController.getAllAnggota);
router.post('/anggota', verifyToken, cekRole(['ketua', 'sekretaris']), anggotaController.createAnggota);
router.put('/anggota/:id', verifyToken, cekRole(['ketua', 'sekretaris']), anggotaController.updateAnggota);
router.delete('/anggota/:id', verifyToken, cekRole(['ketua', 'sekretaris']), anggotaController.deleteAnggota);

// --- INVENTARIS & PEMINJAMAN ---
router.get('/inventaris', inventarisController.getAllInventaris);
router.post('/inventaris', verifyToken, cekRole(['ketua', 'sekretaris']), inventarisController.createInventaris);
router.put('/inventaris/:id', verifyToken, cekRole(['ketua', 'sekretaris']), inventarisController.updateInventaris);
router.delete('/inventaris/:id', verifyToken, cekRole(['ketua', 'sekretaris']), inventarisController.deleteInventaris);

router.get('/peminjaman', inventarisController.getAllPeminjaman);
router.post('/peminjaman', verifyToken, cekRole(['ketua', 'sekretaris']), inventarisController.createPeminjaman);
router.put('/peminjaman/:id/kembali', verifyToken, cekRole(['ketua', 'sekretaris']), inventarisController.kembalikanPeminjaman);
router.delete('/peminjaman/:id', verifyToken, cekRole(['ketua', 'sekretaris']), inventarisController.deletePeminjaman);

module.exports = router;