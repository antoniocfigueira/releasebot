import { Github } from 'lucide-react';

function Footer() {
  return (
    <footer className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
        <p>
          ReleaseBOT - Projeto M8 | Antonio Figueira
        </p>
        <a
          className="inline-flex items-center gap-2 font-medium text-slate-700 hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400"
          href="#"
          aria-label="GitHub"
        >
          <Github size={18} />
          GitHub
        </a>
      </div>
    </footer>
  );
}

export default Footer;
