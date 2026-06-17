import { LogOut, Moon, Sun, User } from 'lucide-react';
import { useState } from 'react';

function Header({ isDarkMode, setIsDarkMode, onLogout }) {
  const [showAccount, setShowAccount] = useState(false);

  return (
    <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Projeto M8</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            Gestor de lançamentos de música
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Releases, calendário, campanhas e chat bot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={() => setIsDarkMode((current) => !current)}
            aria-label="Alternar tema"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => setShowAccount((current) => !current)}
            >
              <User size={16} />
              admin
            </button>

            {showAccount && (
              <div className="absolute right-0 z-30 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">admin</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Conta local</p>
                </div>

                <button
                  className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
                  onClick={onLogout}
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
