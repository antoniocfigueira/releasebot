import { CalendarPlus, CheckCircle2, Database, Shuffle, Trash2 } from 'lucide-react';
import { useState } from 'react';

const titles = [
  'Midnight Signal',
  'Neon Heart',
  'Golden Room',
  'After Hours',
  'Blue Static',
  'Last Call',
  'Velvet Sky',
  'City Lights',
  'No Sleep',
  'Ocean Drive',
  'Lost Tape',
  'Slow Motion',
  'New Wave',
  'Crystal Echo',
  'Radio Ghost',
  'Summer Rain',
  'Dark Bloom',
  'Future Love',
  'Silver Line',
  'Night Vision'
];

const artists = ['Daniel Moraes', 'Luna Vale', 'Marco Silva', 'Nina Cruz', 'Rafa Beats'];
const genres = ['pop', 'edm', 'hip hop', 'indie', 'r&b'];
const types = ['single', 'ep', 'album'];
const priorities = ['low', 'medium', 'high'];
const statuses = ['draft', 'pending', 'published'];

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getReleaseDate(index) {
  const date = new Date();
  date.setDate(date.getDate() + index + Math.floor(Math.random() * 40));
  return date.toISOString().slice(0, 10);
}

function addDays(dateValue, days) {
  const date = new Date(`${dateValue.slice(0, 10)}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function createTestReleases() {
  return titles.map((title, index) => ({
    title,
    artist: getRandomItem(artists),
    type: getRandomItem(types),
    release_date: getReleaseDate(index),
    genre: getRandomItem(genres),
    distributor: 'DistroKid',
    priority: getRandomItem(priorities),
    status: getRandomItem(statuses),
    notes: 'Release criado para teste'
  }));
}

function AdminSettings({ releases, onCreated, onDeleteAll }) {
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');

  async function updateRelease(id, data) {
    await fetch(`/api/releases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  async function runBulkUpdate(callback, successMessage) {
    setIsUpdating(true);
    setMessage('');

    try {
      for (const release of releases) {
        await updateRelease(release.id, callback(release));
      }

      await onCreated();
      setMessage(successMessage);
    } catch {
      setMessage('Não foi possível atualizar os releases.');
    } finally {
      setIsUpdating(false);
    }
  }

  async function seedReleases() {
    setIsCreating(true);
    setMessage('');

    try {
      const releases = createTestReleases();

      for (const release of releases) {
        await fetch('/api/releases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(release)
        });
      }

      await onCreated();
      setMessage('Foram criados 20 releases de teste.');
    } catch {
      setMessage('Não foi possível criar os releases de teste.');
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteAllReleases() {
    const confirmed = window.confirm('Apagar todos os releases?');
    if (!confirmed) return;

    setIsDeleting(true);
    setMessage('');

    try {
      for (const release of releases) {
        await fetch(`/api/releases/${release.id}`, {
          method: 'DELETE'
        });
      }

      await onDeleteAll();
      setMessage('Todos os releases foram apagados.');
    } catch {
      setMessage('Não foi possível apagar todos os releases.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Admin settings</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Ferramentas admin
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Dados de teste</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Cria vários releases com dados diferentes.
            </p>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={seedReleases}
            disabled={isCreating}
          >
            <Database size={16} />
            {isCreating ? 'A criar...' : 'Criar 20 releases'}
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Estados rápidos</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Mudar o estado de todos os releases.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['draft', 'pending', 'published'].map((status) => (
              <button
                key={status}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-900"
                onClick={() => runBulkUpdate(() => ({ status }), `Todos os releases ficaram como ${status}.`)}
                disabled={isUpdating || releases.length === 0}
              >
                <CheckCircle2 size={15} />
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Prioridades</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Prioridades aleatórias
            </p>
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-900"
            onClick={() => runBulkUpdate(() => ({ priority: getRandomItem(priorities) }), 'done')}
            disabled={isUpdating || releases.length === 0}
          >
            <Shuffle size={15} />
            Randomizar prioridades
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="mb-4">
            <h3 className="font-medium text-slate-900 dark:text-slate-100">Datas</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Adia todos os releases 7 dias
            </p>
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-900"
            onClick={() => runBulkUpdate((release) => ({ release_date: addDays(release.release_date, 7) }), 'done')}
            disabled={isUpdating || releases.length === 0}
          >
            <CalendarPlus size={15} />
            Adiar 7 dias
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-medium text-red-900 dark:text-red-100">Limpar releases</h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-200">
              Apagar todos os releases da db
            </p>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={deleteAllReleases}
            disabled={isDeleting || releases.length === 0}
          >
            <Trash2 size={16} />
            {isDeleting ? 'A apagar...' : 'Apagar todos'}
          </button>
        </div>
      </div>

      {message && (
        <p className="rounded-lg bg-white px-3 py-2 text-sm text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
          {message}
        </p>
      )}
    </section>
  );
}

export default AdminSettings;
