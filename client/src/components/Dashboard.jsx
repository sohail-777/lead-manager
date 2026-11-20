import { STATUSES } from '../constants';

// Clicking a card filters the table by that status.
export default function Dashboard({ stats, active, onSelect }) {
  return (
    <div className="stats">
      <button className={`stat ${active === '' ? 'active' : ''}`} onClick={() => onSelect('')}>
        <span className="stat-num">{stats?.total ?? '–'}</span>
        <span className="stat-label">Total</span>
      </button>
      {STATUSES.map((s) => (
        <button key={s} className={`stat ${active === s ? 'active' : ''}`} onClick={() => onSelect(s)}>
          <span className="stat-num">{stats?.byStatus[s] ?? '–'}</span>
          <span className="stat-label">{s}</span>
        </button>
      ))}
    </div>
  );
}
