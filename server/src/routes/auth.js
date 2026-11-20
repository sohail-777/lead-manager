const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');
const { validateSignup, EMAIL_RE } = require('../validators');

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

router.post('/signup', async (req, res, next) => {
  try {
    const { errors, value } = validateSignup(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ message: 'Validation failed', errors });

    if (await User.exists({ email: value.email })) {
      return res.status(409).json({ message: 'Email already registered', errors: { email: 'Email already registered' } });
    }
    const password = await bcrypt.hash(value.password, 10);
    const user = await User.create({ ...value, password });
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    if (!EMAIL_RE.test(email) || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: signToken(user._id), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
