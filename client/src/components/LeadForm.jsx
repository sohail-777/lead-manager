import { useState } from 'react';
import { api } from '../api';
import { SOURCES, STATUSES } from '../constants';
import { validateLead } from '../validation';
import Field from './Field.jsx';
import Modal from './Modal.jsx';

export default function LeadForm({ lead, onClose, onSaved }) {
  const editing = !!lead;
  const [form, setForm] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    company: lead?.company || '',
    source: lead?.source || '',
    status: lead?.status || 'New',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setServerError('');
    const v = validateLead(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      await (editing ? api.updateLead(lead._id, form) : api.createLead(form));
      onSaved(editing ? 'Lead updated' : 'Lead added');
    } catch (err) {
      setErrors(err.errors || {});
      setServerError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={editing ? 'Edit lead' : 'Add lead'} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        {serverError && <div className="alert">{serverError}</div>}
        <div className="grid2">
          <Field label="Name *" error={errors.name}>
            <input value={form.name} onChange={set('name')} autoFocus />
          </Field>
          <Field label="Email *" error={errors.email}>
            <input type="email" value={form.email} onChange={set('email')} />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <input value={form.phone} onChange={set('phone')} placeholder="+1 555 123 4567" />
          </Field>
          <Field label="Company" error={errors.company}>
            <input value={form.company} onChange={set('company')} />
          </Field>
          <Field label="Source *" error={errors.source}>
            <select value={form.source} onChange={set('source')}>
              <option value="">Select source…</option>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Status *" error={errors.status}>
            <select value={form.status} onChange={set('status')}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div className="actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add lead'}</button>
        </div>
      </form>
    </Modal>
  );
}
