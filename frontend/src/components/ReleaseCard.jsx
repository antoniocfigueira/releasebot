import { useState } from 'react';

const priorityStyles = {
  high: {
    label: 'Alta',
    card: 'border-red-300 hover:border-red-400',
    tag: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200'
  },
  medium: {
    label: 'Média',
    card: 'border-amber-300 hover:border-amber-400',
    tag: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200'
  },
  low: {
    label: 'Baixa',
    card: 'border-emerald-300 hover:border-emerald-400',
    tag: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200'
  }
};

function getDateValue(date) {
  return date ? date.slice(0, 10) : '';
}

function formatReleaseDate(date) {
  if (!date) return '';
  return date.slice(0, 10).split('-').reverse().join('/');
}

function ReleaseCard({ release, onUpdate }) {
  const priority = priorityStyles[release.priority] || priorityStyles.medium;
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    title: release.title,
    release_date: getDateValue(release.release_date),
    priority: release.priority || 'medium',
    status: release.status || 'draft'
  });

  async function saveRelease() {
    await onUpdate(release.id, form);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <article className={`relative z-10 rounded-lg border bg-white p-4 shadow-md dark:bg-slate-900 ${priority.card}`}>
        <div className="grid gap-3">
          <input
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
          />
          <input
            type="date"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            value={form.release_date}
            onChange={(event) => setForm({ ...form, release_date: event.target.value })}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={form.priority}
              onChange={(event) => setForm({ ...form, priority: event.target.value })}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
            <select
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            >
              <option value="draft">Draft</option>
              <option value="pending">Pendente</option>
              <option value="published">Publicado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              onClick={saveRelease}
            >
              Guardar
            </button>
            <button
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`relative z-0 rounded-lg border bg-white p-4 shadow-sm transition hover:z-20 hover:-translate-y-1 hover:shadow-md dark:bg-slate-900 ${priority.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{release.title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{release.artist}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${priority.tag}`}>
          {priority.label}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
        <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
          {release.type}
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {release.status}
        </span>
        <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
          {formatReleaseDate(release.release_date)}
        </span>
        <span className="rounded-md bg-violet-50 px-2 py-1 text-violet-700 dark:bg-violet-950 dark:text-violet-200">
          {release.genre || 'Sem género'}
        </span>
      </div>

      <button
        className="mt-4 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        onClick={() => setIsEditing(true)}
      >
        Editar
      </button>
    </article>
  );
}

export default ReleaseCard;
