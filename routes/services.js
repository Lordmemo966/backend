const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Service = require('../models/Service');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/services  — public
router.get('/', asyncHandler(async (req, res) => {
  const services = await Service.find({ active: true }).sort({ order: 1 });
  res.json({ success: true, data: services });
}));

// POST /api/services  — admin
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const count = await Service.countDocuments();
  const service = await Service.create({ ...req.body, order: count });
  res.status(201).json({ success: true, data: service });
}));

// PUT /api/services/:id  — admin
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!service) return res.status(404).json({ success: false, message: 'الخدمة غير موجودة' });
  res.json({ success: true, data: service });
}));

// DELETE /api/services/:id  — admin
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'تم حذف الخدمة' });
}));

module.exports = router;
