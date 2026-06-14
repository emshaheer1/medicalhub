require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function seed() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log('Admin already exists:', email);
  } else {
    await Admin.create({ email, password, name: 'Admin' });
    console.log('Admin created:', email);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
