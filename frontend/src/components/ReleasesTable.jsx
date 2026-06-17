import { ArrowDownUp, Check, Pencil, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

function formatDate(date) {
  if (!date) return '-';
  return date.slice(0, 10).split('-').reverse().join('/');
}

function getDateValue(date) {
  return date ? date.slice(0, 10) : '';
}

const priorityLabels = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa'
};

const columns = [
  { label: 'Título', field: 'title' },
  { label: 'Artista', field: 'artist' },
  { label: 'Tipo', field: 'type' },
  { label: 'Data', field: 'release_date' },
  { label: 'Prioridade', field: 'priority' },
  { label: 'Estado', field: 'status' },
  { label: 'Género', field: 'genre' }
];

function getSortValue(release, field) {
  if (field === 'priority') {
    return { high: 3, medium: 2, low: 1 }[release.priority] || 0;
  }

  return (release[field] || '').toString().toLowerCase();
}

function getUniqueValues(releases, field) {
  return [...new Set(releases.map((release) => release[field]).filter(Boolean))].sort();
}

function ReleasesTable({ releases, onUpdate, onDelete }) {
  const [sortField, setSortField] = useState('release_date');
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [genreFilter, setGenreFilter] = useState('todos');

  const genres = useMemo(() => getUniqueValues(releases, 'genre'), [releases]);

  const filteredReleases = useMemo(() => {
    return releases.filter((release) => {
      const text = `${release.title} ${release.artist} ${release.genre} ${release.type} ${release.status}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || release.status === statusFilter;
      const matchesType = typeFilter === 'todos' || release.type === typeFilter;
      const matchesGenre = genreFilter === 'todos' || release.genre === genreFilter;

      return matchesSearch && matchesStatus && matchesType && matchesGenre;
    });
  }, [releases, search, statusFilter, typeFilter, genreFilter]);

  const sortedReleases = useMemo(() => {
    return [...filteredReleases].sort((first, second) => {
      const firstValue = getSortValue(first, sortField);
      const secondValue = getSortValue(second, sortField);

      if (firstValue > secondValue) return sortDirection === 'asc' ? 1 : -1;
      if (firstValue < secondValue) return sortDirection === 'asc' ? -1 : 1;
      return 0;
    });
  }, [filteredReleases, sortField, sortDirection]);

  function changeSort(field) {
    if (sortField === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(field);
    setSortDirection('asc');
  }

  function startEdit(release) {
    setEditingId(release.id);
    setForm({
      title: release.title || '',
      artist: release.artist || '',
      type: release.type || 'single',
      release_date: getDateValue(release.release_date),
      genre: release.genre || '',
      distributor: release.distributor || '',
      priority: release.priority || 'medium',
      status: release.status || 'draft',
      notes: release.notes || ''
    });
  }

  async function saveEdit(id) {
    await onUpdate(id, form);
    setEditingId(null);
    setForm({});
  }

  async function deleteItem(id) {
    const confirmed = window.confirm('Apagar este release?');
    if (!confirmed) return;
    await onDelete(id);
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Lista de releases</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {sortedReleases.length} de {releases.length} items
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
            <Search size={16} className="text-slate-400" />
            <input
              className="bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
              placeholder="Pesquisar"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="todos">Todos os estados</option>
            <option value="draft">draft</option>
            <option value="pending">pending</option>
            <option value="published">published</option>
            <option value="cancelled">cancelled</option>
          </select>

          <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="todos">Todos os tipos</option>
            <option value="single">single</option>
            <option value="ep">ep</option>
            <option value="album">album</option>
          </select>

          <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" value={genreFilter} onChange={(event) => setGenreFilter(event.target.value)}>
            <option value="todos">Todos os géneros</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[940px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-800 dark:text-slate-400">
              {columns.map((column) => (
                <th key={column.field} className="py-3 pr-4 font-medium">
                  <button
                    className={`inline-flex items-center gap-1 transition hover:text-blue-600 dark:hover:text-blue-300 ${
                      sortField === column.field ? 'text-blue-600 dark:text-blue-300' : ''
                    }`}
                    onClick={() => changeSort(column.field)}
                  >
                    {column.label}
                    <ArrowDownUp size={13} />
                    {sortField === column.field && (
                      <span className="normal-case">
                        {sortDirection === 'asc' ? 'asc' : 'desc'}
                      </span>
                    )}
                  </button>
                </th>
              ))}
              <th className="py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedReleases.map((release) => {
              const isEditing = editingId === release.id;

              return (
                <tr
                  key={release.id}
                  className="border-b border-slate-100 text-slate-700 last:border-0 dark:border-slate-800 dark:text-slate-200"
                >
                  <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">
                    {isEditing ? (
                      <input className="w-36 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" value={form.title} onChange={(event) => updateForm('title', event.target.value)} />
                    ) : release.title}
                  </td>
                  <td className="py-3 pr-4">
                    {isEditing ? (
                      <input className="w-32 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" value={form.artist} onChange={(event) => updateForm('artist', event.target.value)} />
                    ) : release.artist}
                  </td>
                  <td className="py-3 pr-4">
                    {isEditing ? (
                      <select className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" value={form.type} onChange={(event) => updateForm('type', event.target.value)}>
                        <option value="single">single</option>
                        <option value="ep">ep</option>
                        <option value="album">album</option>
                      </select>
                    ) : release.type}
                  </td>
                  <td className="py-3 pr-4">
                    {isEditing ? (
                      <input type="date" className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" value={form.release_date} onChange={(event) => updateForm('release_date', event.target.value)} />
                    ) : formatDate(release.release_date)}
                  </td>
                  <td className="py-3 pr-4">
                    {isEditing ? (
                      <select className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" value={form.priority} onChange={(event) => updateForm('priority', event.target.value)}>
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                      </select>
                    ) : priorityLabels[release.priority] || 'Média'}
                  </td>
                  <td className="py-3 pr-4">
                    {isEditing ? (
                      <select className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" value={form.status} onChange={(event) => updateForm('status', event.target.value)}>
                        <option value="draft">draft</option>
                        <option value="pending">pending</option>
                        <option value="published">published</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    ) : release.status}
                  </td>
                  <td className="py-3 pr-4">
                    {isEditing ? (
                      <input className="w-28 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" value={form.genre} onChange={(event) => updateForm('genre', event.target.value)} />
                    ) : release.genre || '-'}
                  </td>
                  <td className="py-3">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700" onClick={() => saveEdit(release.id)} aria-label="Guardar">
                          <Check size={15} />
                        </button>
                        <button className="rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => setEditingId(null)} aria-label="Cancelar">
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button className="rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => startEdit(release)} aria-label="Editar">
                          <Pencil size={15} />
                        </button>
                        <button className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950" onClick={() => deleteItem(release.id)} aria-label="Apagar">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ReleasesTable;
