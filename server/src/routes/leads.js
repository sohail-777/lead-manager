const express = require('express');
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const requireAuth = require('../middleware/auth');
const { validateLead } = require('../validators');
const { STATUSES, SORT_FIELDS } = require('../constants');

const router = express.Router();
router.use(requireAuth);

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Reject malformed ids early so Mongoose doesn't throw a CastError.
router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid lead id' });
  next();
});

// GET /api/leads?search=&status=&page=&limit=&sortBy=&order=
router.get('/', async (req, res, next) => {
  try {
    const { search = '', status = '', sortBy = 'createdAt', order = 'desc' } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

    const filter = { user: req.userId };
    if (status) {
      if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status filter' });
      filter.status = status;
    }
    if (String(search).trim()) filter.name = new RegExp(escapeRegex(String(search).trim()), 'i');

    const sortField = SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sort = { [sortField]: order === 'asc' ? 1 : -1, _id: -1 };

    const [data, total] = await Promise.all([
      Lead.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
      Lead.countDocuments(filter),
    ]);

    res.json({
      data,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/leads/stats  -> count per status
router.get('/stats', async (req, res, next) => {
  try {
    const rows = await Lead.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    rows.forEach((r) => (byStatus[r._id] = r.count));
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
    res.json({ total, byStatus });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, user: req.userId });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { errors, value } = validateLead(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Validation failed', errors });
    const lead = await Lead.create({ ...value, user: req.userId });
    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { errors, value } = validateLead(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Validation failed', errors });
    const lead = await Lead.findOneAndUpdate({ _id: req.params.id, user: req.userId }, value, {
      new: true,
      runValidators: true,
    });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted', id: lead._id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
