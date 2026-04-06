const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Stats = require('../models/Stats');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/stats/track  — public (called on each page visit)
router.post('/track', asyncHandler(async (req, res) => {
  const { page } = req.body;
  const date = new Date().toISOString().split('T')[0];

  const inc = { total: 1 };
  if (['home','gallery','admin','stats'].includes(page)) inc[`pages.${page}`] = 1;

  await Stats.findOneAndUpdate(
    { date },
    { $inc: inc },
    { upsert: true, new: true }
  );
  res.json({ success: true });
}));

// POST /api/stats/wa  — track WhatsApp click
router.post('/wa', asyncHandler(async (req, res) => {
  const date = new Date().toISOString().split('T')[0];
  await Stats.findOneAndUpdate({ date }, { $inc: { waClicks: 1 } }, { upsert: true });
  res.json({ success: true });
}));

// GET /api/stats  — admin only
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const from = new Date();
  from.setDate(from.getDate() - days);
  const fromStr = from.toISOString().split('T')[0];

  const data = await Stats.find({ date: { $gte: fromStr } }).sort({ date: 1 }).lean();

  const totals = data.reduce(
    (acc, d) => {
      acc.total    += d.total;
      acc.waClicks += d.waClicks || 0;
      acc.pages.home    += d.pages?.home    || 0;
      acc.pages.gallery += d.pages?.gallery || 0;
      acc.pages.admin   += d.pages?.admin   || 0;
      acc.pages.stats   += d.pages?.stats   || 0;
      return acc;
    },
    { total: 0, waClicks: 0, pages: { home: 0, gallery: 0, admin: 0, stats: 0 } }
  );

  res.json({ success: true, data: { daily: data, totals, activeDays: data.length } });
}));

// DELETE /api/stats  — admin only (clear all)
router.delete('/', protect, adminOnly, asyncHandler(async (req, res) => {
  await Stats.deleteMany();
  res.json({ success: true, message: 'تم مسح الإحصائيات' });
}));

module.exports = router;
