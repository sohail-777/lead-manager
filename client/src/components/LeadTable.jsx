const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'company', label: 'Company' },
  { key: 'source', label: 'Source' },
  { key: 'status', label: 'Status' },
];
const SORTABLE = ['name', 'email', 'company', 'source', 'status'];

export default function LeadTable({ leads, sortBy, order, onSort, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {COLUMNS.map((c) => {
              const sortable = SORTABLE.includes(c.key);
              const active = sortBy === c.key;
              return (
                <th key={c.key} className={sortable ? 'sortable' : ''} onClick={sortable ? () => onSort(c.key) : undefined}
                    aria-sort={active ? (order === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {c.label} {active && (order === 'asc' ? '▲' : '▼')}
                </th>
              );
            })}
            <th className="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l._id}>
              <td data-label="Name"><strong>{l.name}</strong></td>
              <td data-label="Email">{l.email}</td>
              <td data-label="Phone">{l.phone || '—'}</td>
              <td data-label="Company">{l.company || '—'}</td>
              <td data-label="Source">{l.source}</td>
              <td data-label="Status"><span className={`badge ${l.status.toLowerCase()}`}>{l.status}</span></td>
              <td className="right nowrap">
                <button className="btn small" onClick={() => onEdit(l)}>Edit</button>{' '}
                <button className="btn small danger-outline" onClick={() => onDelete(l)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
