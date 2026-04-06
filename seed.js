/**
 * Seed script — run manually:  node server/seed.js
 * Seeds admin user + default settings + default services
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ── Models ──
  const User     = require('./models/User');
  const Settings = require('./models/Settings');
  const Service  = require('./models/Service');

  // ── Admin user ──
  const existingUser = await User.findOne({ username: process.env.ADMIN_USERNAME });
  if (existingUser) {
    console.log('👤 Admin user already exists — skipping');
  } else {
    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await User.create({ username: process.env.ADMIN_USERNAME, password: hash, role: 'admin' });
    console.log('👤 Admin user created:', process.env.ADMIN_USERNAME);
  }

  // ── Settings ──
  const existingSettings = await Settings.findOne();
  if (existingSettings) {
    console.log('⚙️  Settings already exist — skipping');
  } else {
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
    console.log('⚙️  Default settings created');
  }

  // ── Services ──
  const serviceCount = await Service.countDocuments();
  if (serviceCount > 0) {
    console.log('🔧 Services already exist — skipping');
  } else {
    const services = [
      { icon: '🛋️', name: 'أثاث المنازل',  description: 'غرف نوم، صالونات، مطابخ بتصاميم عصرية وكلاسيكية', order: 0 },
      { icon: '🏢', name: 'أثاث المكاتب',  description: 'مكاتب، رفوف، أنظمة تخزين للشركات والمؤسسات',       order: 1 },
      { icon: '🚪', name: 'أبواب ونوافذ',  description: 'أبواب خشبية مصمتة ومزخرفة بأحدث التصاميم',        order: 2 },
      { icon: '🎨', name: 'ديكور داخلي',   description: 'ألواح خشبية للجدران، أسقف، إطارات زخرفية',        order: 3 },
      { icon: '🔧', name: 'صيانة وترميم',  description: 'إصلاح وتجديد الأثاث القديم بأسعار مناسبة',        order: 4 },
      { icon: '📐', name: 'تصميم مخصص',    description: 'تنفيذ أي تصميم حسب رغبة العميل بدقة عالية',       order: 5 },
    ];
    await Service.insertMany(services);
    console.log('🔧 Default services created:', services.length);
  }

  console.log('\n✅ Seed complete!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
