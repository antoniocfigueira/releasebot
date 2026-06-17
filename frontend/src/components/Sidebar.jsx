import { Disc3 } from 'lucide-react';

const pages = ['Dashboard', 'Releases', 'Calendário', 'Campanhas', 'Definições'];

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-slate-900 p-2 text-white">
          <Disc3 size={22} />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 dark:text-slate-100">ReleaseBOT</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Music release manager</p>
        </div>
      </div>

      <nav className="mt-8 space-y-2 text-sm">
        {pages.map((page) => (
          <button
            key={page}
            className={`w-full rounded-lg px-3 py-2 text-left transition ${
              activePage === page
                ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500 dark:text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            onClick={() => setActivePage(page)}
          >
            {page}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
