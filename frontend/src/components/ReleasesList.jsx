import ReleaseCard from './ReleaseCard.jsx';

function ReleasesList({ releases, onUpdate, title = 'Releases recentes' }) {
  return (
    <section className="overflow-visible rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">{releases.length} items</span>
      </div>

      <div className="grid max-h-[430px] gap-3 overflow-y-auto overflow-x-visible px-1 py-2 sm:grid-cols-2 xl:grid-cols-3">
        {releases.map((release) => (
          <ReleaseCard key={release.id} release={release} onUpdate={onUpdate} />
        ))}
      </div>
    </section>
  );
}

export default ReleasesList;
