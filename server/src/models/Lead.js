const mongoose = require('mongoose');
const { STATUSES, SOURCES } = require('../constants');

const leadSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '', maxlength: 100 },
    source: { type: String, enum: SOURCES, required: true },
    status: { type: String, enum: STATUSES, default: 'New', required: true },
  },
  { timestamps: true }
);

// Common access patterns: a user's leads, filtered by status, newest first.
leadSchema.index({ user: 1, status: 1 });
leadSchema.index({ user: 1, createdAt: -1 });
leadSchema.index({ user: 1, name: 1 });
// A user cannot have two leads with the same email.
leadSchema.index({ user: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Lead', leadSchema);
