const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/settings  — public
router.get('/', asyncHandler(async (req, res) => {
  const settings = await Settings.findOne().lean();
  res.json({ success: true, data: settings });
}));

// PUT /api/settings  — admin only
router.put('/', protect, adminOnly, asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();

  const allowed = ['phone','whatsapp','email','address','note','social','hours','maintenance'];
  allowed.forEach(key => { if (req.body[key] !== undefined) settings[key] = req.body[key]; });

  await settings.save();
  res.json({ success: true, data: settings, message: 'تم حفظ الإعدادات بنجاح' });
}));

module.exports = router;
