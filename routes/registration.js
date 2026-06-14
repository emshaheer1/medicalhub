const express = require('express');
const Registration = require('../models/Registration');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/registration', async (req, res) => {
  try {
    const entry = await Registration.create(req.body);
    console.log(
      `[Registration] New submission: ${entry.first_name || ''} ${entry.last_name || ''} — ${entry.course_selected || 'N/A'}`
    );
    res.status(201).json({ success: true, id: entry._id });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Failed to save registration' });
  }
});

router.get('/registrations/export/all', authMiddleware, async (req, res) => {
  try {
    const entries = await Registration.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: entries, total: entries.length });
  } catch (err) {
    console.error('Export registrations error:', err);
    res.status(500).json({ success: false, message: 'Failed to export registrations' });
  }
});

router.get('/registrations', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const course = (req.query.course || '').trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { current_phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (course) {
      filter.course_selected = course;
    }

    const [entries, total] = await Promise.all([
      Registration.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Registration.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: entries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Fetch registrations error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations' });
  }
});

router.get('/registrations/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await Registration.findById(req.params.id).lean();
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    res.json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch entry' });
  }
});

router.delete('/registrations/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await Registration.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete entry' });
  }
});

module.exports = router;
