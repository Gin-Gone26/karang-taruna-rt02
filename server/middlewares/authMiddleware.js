const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'fail', message: 'Akses ditolak, silakan login terlebih dahulu' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ status: 'fail', message: 'Token tidak valid atau sudah kedaluwarsa' });
  }
};

// Middleware pembatas hak akses berdasarkan role
authMiddleware.cekRole = (...rolesDiizinkan) => {
  return (req, res, next) => {
    if (!req.user || !rolesDiizinkan.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Akses ditolak: Role Anda tidak memiliki izin untuk melakukan tindakan ini.'
      });
    }
    next();
  };
};

module.exports = authMiddleware;