const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Gallery = require('../models/Gallery');
const { protect, adminOnly } = require('../middleware/auth');
const { cloudinary, upload } = require('../middleware/upload');

// GET /api/gallery  — public
router.get('/', asyncHandler(async (req, res) => {
  const images = await Gallery.find().sort({ order: 1, createdAt: -1 });
  res.json({ success: true, data: images });
}));

// POST /api/gallery  — admin only, upload to Cloudinary
router.post('/', protect, adminOnly, upload.array('images', 20), asyncHandler(async (req, res) => {
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'لم تُرسل صور' });

  const count = await Gallery.countDocuments();
  const saved = await Gallery.insertMany(
    req.files.map((f, i) => ({
      url:      f.path,
      publicId: f.filename,
      caption:  req.body.captions?.[i] || '',
      order:    count + i,
    }))
  );
  res.status(201).json({ success: true, data: saved, message: 'تم رفع الصور بنجاح' });
}));

// DELETE /api/gallery/:id  — admin only
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const image = await Gallery.findById(req.params.id);
  if (!image) return res.status(404).json({ success: false, message: 'الصورة غير موجودة' });

  await cloudinary.uploader.destroy(image.publicId);
  await image.deleteOne();
  res.json({ success: true, message: 'تم حذف الصورة' });
}));

// PUT /api/gallery/reorder  — admin only
router.put('/reorder', protect, adminOnly, asyncHandler(async (req, res) => {
  const { ids } = req.body; // array of ids in desired order
  await Promise.all(ids.map((id, i) => Gallery.findByIdAndUpdate(id, { order: i })));
  res.json({ success: true, message: 'تم إعادة الترتيب' });
}));

module.exports = router;
