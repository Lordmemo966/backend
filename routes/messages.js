const express  = require('express');
const router   = express.Router();
const asyncHandler = require('express-async-handler');
const Message  = require('../models/Message');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/messages  — public (visitor submits contact form)
router.post('/', asyncHandler(async (req, res) => {
  const { name, phone, email, message } = req.body;
  if (!name?.trim() || !phone?.trim() || !message?.trim()) {
    return res.status(400).json({ success: false, message: 'الاسم والهاتف والرسالة مطلوبون' });
  }
  const doc = await Message.create({ name, phone, email, message });
  res.status(201).json({ success: true, data: doc, message: 'تم إرسال رسالتك بنجاح، سنتواصل معك قريباً' });
}));

// GET /api/messages  — admin only
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const page  = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip  = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Message.countDocuments(),
  ]);
  const unread = await Message.countDocuments({ read: false });

  res.json({ success: true, data: messages, total, page, unread });
}));

// PATCH /api/messages/:id/read  — admin only
router.patch('/:id/read', protect, adminOnly, asyncHandler(async (req, res) => {
  await Message.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
}));

// DELETE /api/messages/:id  — admin only
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'تم حذف الرسالة' });
}));

module.exports = router;
