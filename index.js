const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const morgan   = require('morgan');
const dotenv   = require('dotenv');
const path     = require('path');

dotenv.config();

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/gallery',  require('./routes/gallery'));
app.use('/api/stats',    require('./routes/stats'));
app.use('/api/services', require('./routes/services'));
app.use('/api/messages', require('./routes/messages'));

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV, time: new Date() })
);

// ── Serve React build in production ───────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '../client/build');
  app.use(express.static(clientBuild));
  app.get('*', (_req, res) =>
    res.sendFile(path.join(clientBuild, 'index.html'))
  );
}

// ── Global error handler ───────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'حدث خطأ في الخادم'
      : err.message,
  });
});

// ── Connect & Start ────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await autoSeed();
    app.listen(PORT, () =>
      console.log(`🚀 Server on http://localhost:${PORT}  [${process.env.NODE_ENV}]`)
    );
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ── Auto-seed on first run ─────────────────────────────────
async function autoSeed() {
  const User     = require('./models/User');
  const Settings = require('./models/Settings');
  const Service  = require('./models/Service');
  const bcrypt   = require('bcryptjs');

  // Admin user
  const hasUser = await User.findOne();
  if (!hasUser) {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
    await User.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: hash,
      role: 'admin',
    });
    console.log('👤 Admin user seeded');
  }

  // Settings
  const hasSettings = await Settings.findOne();
  if (!hasSettings) {
    await Settings.create({
      phone:    '+20 100 123 4567',
      whatsapp: '+20 100 123 4567',
      email:    'info@moderncarpentry.eg',
      address:  '١٢ شارع الصناعة، المنطقة الصناعية، القاهرة، مصر',
      note:     'نستقبل الطلبات الخاصة والتصاميم المخصصة.\nيُرجى التواصل مسبقاً لتحديد موعد المعاينة.',
      social:   { facebook: '#', instagram: '#', youtube: '#', twitter: '#' },
      hours: [
        { day: 'السبت',    open: '09:00', close: '21:00', closed: false },
        { day: 'الأحد',    open: '09:00', close: '21:00', closed: false },
        { day: 'الاثنين',  open: '09:00', close: '21:00', closed: false },
        { day: 'الثلاثاء', open: '09:00', close: '21:00', closed: false },
        { day: 'الأربعاء', open: '09:00', close: '21:00', closed: false },
        { day: 'الخميس',   open: '09:00', close: '18:00', closed: false },
        { day: 'الجمعة',   open: '09:00', close: '21:00', closed: true  },
      ],
      maintenance: false,
    });
    console.log('⚙️  Default settings seeded');
  }

  // Services
  const hasServices = await Service.countDocuments();
  if (!hasServices) {
    await Service.insertMany([
      { icon: '🛋️', name: 'أثاث المنازل',  description: 'غرف نوم، صالونات، مطابخ بتصاميم عصرية وكلاسيكية', order: 0 },
      { icon: '🏢', name: 'أثاث المكاتب',  description: 'مكاتب، رفوف، أنظمة تخزين للشركات والمؤسسات',       order: 1 },
      { icon: '🚪', name: 'أبواب ونوافذ',  description: 'أبواب خشبية مصمتة ومزخرفة بأحدث التصاميم',        order: 2 },
      { icon: '🎨', name: 'ديكور داخلي',   description: 'ألواح خشبية للجدران، أسقف، إطارات زخرفية',        order: 3 },
      { icon: '🔧', name: 'صيانة وترميم',  description: 'إصلاح وتجديد الأثاث القديم بأسعار مناسبة',        order: 4 },
      { icon: '📐', name: 'تصميم مخصص',    description: 'تنفيذ أي تصميم حسب رغبة العميل بدقة عالية',       order: 5 },
    ]);
    console.log('🔧 Default services seeded');
  }
}
