import { useState } from 'react';
import { api } from '../api';
import { validateAuth } from '../validation';
import Field from './Field.jsx';

export default function AuthForm({ onAuth }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const v = validateAuth(form, isSignup);
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      const body = { ...form, email: form.email.trim(), name: form.name.trim() };
      onAuth(await (isSignup ? api.signup(body) : api.login(body)));
    } catch (err) {
      setErrors(err.errors || {});
      setServerError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit} noValidate>
        <h1>Lead Manager</h1>
        <p className="muted">{isSignup ? 'Create your account' : 'Sign in to your account'}</p>
        {serverError && <div className="alert">{serverError}</div>}
        {isSignup && (
          <Field label="Name" error={errors.name}>
            <input value={form.name} onChange={set('name')} autoComplete="name" />
          </Field>
        )}
        <Field label="Email" error={errors.email}>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" />
        </Field>
        <Field label="Password" error={errors.password}>
          <input type="password" value={form.password} onChange={set('password')} autoComplete={isSignup ? 'new-password' : 'current-password'} />
        </Field>
        <button className="btn primary block" disabled={busy}>
          {busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
        </button>
        <p className="muted center-text">
          {isSignup ? 'Already have an account?' : 'New here?'}{' '}
          <button type="button" className="link" onClick={() => { setIsSignup(!isSignup); setErrors({}); setServerError(''); }}>
            {isSignup ? 'Log in' : 'Create an account'}
          </button>
        </p>
      </form>
    </div>
  );
}
