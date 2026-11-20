import { SOURCES, STATUSES } from './constants';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;

// Mirrors server/src/validators.js so users get instant feedback.
export function validateLead(f) {
  const e = {};
  const name = f.name.trim();
  const email = f.email.trim();
  const phone = f.phone.trim();

  if (!name) e.name = 'Name is required';
  else if (name.length > 100) e.name = 'Name must be at most 100 characters';
  if (!email) e.email = 'Email is required';
  else if (!EMAIL_RE.test(email)) e.email = 'Enter a valid email address';
  if (phone && (!PHONE_RE.test(phone) || phone.replace(/\D/g, '').length < 7)) e.phone = 'Enter a valid phone number';
  if (f.company.trim().length > 100) e.company = 'Company must be at most 100 characters';
  if (!SOURCES.includes(f.source)) e.source = 'Please choose a source';
  if (!STATUSES.includes(f.status)) e.status = 'Please choose a status';
  return e;
}

export function validateAuth(f, isSignup) {
  const e = {};
  if (isSignup && !f.name.trim()) e.name = 'Name is required';
  if (!f.email.trim()) e.email = 'Email is required';
  else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Enter a valid email address';
  if (!f.password) e.password = 'Password is required';
  else if (isSignup && f.password.length < 6) e.password = 'Password must be at least 6 characters';
  return e;
}
