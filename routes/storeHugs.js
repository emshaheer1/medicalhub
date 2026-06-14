const express = require('express');
const PhlebotomyAgreement = require('../models/PhlebotomyAgreement');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/storeHugs', async (req, res) => {
  try {
    const entry = await PhlebotomyAgreement.create(req.body);
    res.status(201).json({ status: true, id: entry._id });
  } catch (err) {
    console.error('Phlebotomy agreement error:', err);
    res.status(500).json({ status: false, message: 'Failed to save agreement' });
  }
});

router.get('/agreements', authMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const [entries, total] = await Promise.all([
      PhlebotomyAgreement.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      PhlebotomyAgreement.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: entries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Fetch agreements error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch agreements' });
  }
});

router.get('/agreements/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await PhlebotomyAgreement.findById(req.params.id).lean();
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    res.json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch entry' });
  }
});

router.delete('/agreements/:id', authMiddleware, async (req, res) => {
  try {
    const entry = await PhlebotomyAgreement.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete entry' });
  }
});

module.exports = router;
