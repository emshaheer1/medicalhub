const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Registration = require('../models/Registration');
const PhlebotomyAgreement = require('../models/PhlebotomyAgreement');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: { name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  res.json({ success: true, admin: { name: req.admin.name, email: req.admin.email } });
});

router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const since = req.query.since ? new Date(req.query.since) : new Date(Date.now() - 60 * 1000);
    const registrations = await Registration.find({ createdAt: { $gt: since } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: registrations.map((r) => ({
        id: r._id,
        name: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'New Student',
        email: r.email,
        course: r.course_selected,
        createdAt: r.createdAt,
      })),
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [totalRegistrations, totalAgreements, recentRegistrations] = await Promise.all([
      Registration.countDocuments(),
      PhlebotomyAgreement.countDocuments(),
      Registration.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const courseBreakdown = await Registration.aggregate([
      { $group: { _id: '$course_selected', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalRegistrations,
        totalAgreements,
        recentRegistrations,
        courseBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

module.exports = router;
