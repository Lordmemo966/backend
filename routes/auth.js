const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'أدخل اسم المستخدم وكلمة المرور' });

  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ success: false, message: 'بيانات الدخول غير صحيحة' });

  res.json({ success: true, token: signToken(user._id), user: { id: user._id, username: user.username, role: user.role } });
}));

// PUT /api/auth/change-password  (admin only)
router.put('/change-password', protect, adminOnly, asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword || newPassword.length < 6)
    return res.status(400).json({ success: false, message: 'بيانات غير صالحة' });

  const user = await User.findById(req.user._id);
  if (!(await bcrypt.compare(oldPassword, user.password)))
    return res.status(400).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
}));

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ success: true, user: req.user }));

module.exports = router;
