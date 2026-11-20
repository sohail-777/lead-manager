import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { STATUSES } from '../constants';
import Dashboard from './Dashboard.jsx';
import LeadTable from './LeadTable.jsx';
import LeadForm from './LeadForm.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

const PAGE_SIZE = 10;

function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function LeadsPage({ user, onLogout }) {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState({ sortBy: 'createdAt', order: 'desc' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [formLead, setFormLead] = useState(undefined); // undefined=closed, null=new, object=edit
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounced(search);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [list, s] = await Promise.all([
        api.listLeads({ search: debouncedSearch, status, page, limit: PAGE_SIZE, ...sort }),
        api.stats(),
      ]);
      setLeads(list.data);
      setPagination(list.pagination);
      setStats(s);
      // If the last item on a page was removed, step back a page.
      if (list.data.length === 0 && page > 1) setPage(page - 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, page, sort]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedSearch, status, sort]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSort = (key) =>
    setSort((s) => (s.sortBy === key ? { sortBy: key, order: s.order === 'asc' ? 'desc' : 'asc' } : { sortBy: key, order: 'asc' }));

  const handleSaved = (msg) => {
    setFormLead(undefined);
    setToast(msg);
    load();
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteLead(toDelete._id);
      setToast('Lead deleted');
      setToDelete(null);
      load();
    } catch (err) {
      setError(err.message);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const filtering = debouncedSearch || status;

  return (
    <div className="container">
      <header className="topbar">
        <h1>Lead Manager</h1>
        <div className="topbar-right">
          <span className="muted">{user.name}</span>
          <button className="btn small" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <Dashboard stats={stats} active={status} onSelect={setStatus} />

      <div className="toolbar">
        <input className="search" placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search leads by name" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {filtering && <button className="btn" onClick={() => { setSearch(''); setStatus(''); }}>Clear</button>}
        <button className="btn primary push" onClick={() => setFormLead(null)}>+ Add lead</button>
      </div>

      {error && <div className="alert">{error} <button className="link" onClick={load}>Retry</button></div>}

      <div className="card no-pad">
        {loading && leads.length === 0 ? (
          <p className="empty muted">Loading…</p>
        ) : leads.length === 0 ? (
          <p className="empty muted">{filtering ? 'No leads match your search.' : 'No leads yet. Click “Add lead” to create your first one.'}</p>
        ) : (
          <div className={loading ? 'dim' : ''}>
            <LeadTable leads={leads} sortBy={sort.sortBy} order={sort.order} onSort={handleSort} onEdit={setFormLead} onDelete={setToDelete} />
          </div>
        )}
      </div>

      {pagination.total > 0 && (
        <div className="pager">
          <span className="muted">{pagination.total} lead{pagination.total === 1 ? '' : 's'}</span>
          <div>
            <button className="btn small" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span className="muted pad">Page {pagination.page} of {pagination.totalPages}</span>
            <button className="btn small" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      )}

      {formLead !== undefined && <LeadForm lead={formLead} onClose={() => setFormLead(undefined)} onSaved={handleSaved} />}
      {toDelete && (
        <ConfirmDialog
          title="Delete lead?"
          message={`This will permanently delete “${toDelete.name}”. This cannot be undone.`}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
