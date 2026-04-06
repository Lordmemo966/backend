const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'غير مصرح — يرجى تسجيل الدخول' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'المستخدم غير موجود' });
    next();
  } catch {
    res.status(401).json({ success: false, message: 'توكن غير صالح' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ success: false, message: 'مخصص للمدير فقط' });
  next();
};

module.exports = { protect, adminOnly };
