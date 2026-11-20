const { STATUSES, SOURCES } = require('./constants');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

const str = (v) => (typeof v === 'string' ? v.trim() : '');

function validateLead(body = {}) {
  const errors = {};
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const phone = str(body.phone);
  const company = str(body.company);
  const source = body.source;
  const status = body.status || 'New';

  if (!name) errors.name = 'Name is required';
  else if (name.length > 100) errors.name = 'Name must be at most 100 characters';

  if (!email) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address';

  if (phone && (!PHONE_RE.test(phone) || phone.replace(/\D/g, '').length < 7)) {
    errors.phone = 'Enter a valid phone number';
  }
  if (company.length > 100) errors.company = 'Company must be at most 100 characters';

  if (!source) errors.source = 'Source is required';
  else if (!SOURCES.includes(source)) errors.source = `Source must be one of: ${SOURCES.join(', ')}`;

  if (!STATUSES.includes(status)) errors.status = `Status must be one of: ${STATUSES.join(', ')}`;

  return { errors, value: { name, email, phone, company, source, status } };
}

function validateSignup(body = {}) {
  const errors = {};
  const name = str(body.name);
  const email = str(body.email).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';

  if (!name) errors.name = 'Name is required';
  if (!email) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(email)) errors.email = 'Enter a valid email address';
  if (password.length < 6) errors.password = 'Password must be at least 6 characters';

  return { errors, value: { name, email, password } };
}

module.exports = { validateLead, validateSignup, EMAIL_RE };
