import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

function getMonthDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  return [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => new Date(year, month, index + 1))
  ];
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function CalendarPreview({ releases }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => getMonthDays(currentMonth), [currentMonth]);
  const releasesByDate = useMemo(() => {
    return releases.reduce((items, release) => {
      const key = release.release_date ? release.release_date.slice(0, 10) : null;
      if (!key) return items;
      return { ...items, [key]: [...(items[key] || []), release] };
    }, {});
  }, [releases]);

  function changeMonth(value) {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + value, 1));
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Calendário</h2>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => changeMonth(-1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="w-32 text-center text-sm font-medium capitalize text-slate-700 dark:text-slate-200">
            {currentMonth.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
          </span>
          <button
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={() => changeMonth(1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const key = day ? formatDate(day) : `empty-${index}`;
          const dayReleases = day ? releasesByDate[key] || [] : [];

          return (
            <div
              key={key}
              className={`min-h-20 rounded-lg border p-2 text-sm transition ${
                day
                  ? 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-700 dark:hover:bg-slate-800'
                  : 'border-transparent bg-transparent'
              }`}
            >
              {day && (
                <>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{day.getDate()}</span>
                  <div className="mt-2 space-y-1">
                    {dayReleases.slice(0, 2).map((release) => (
                      <p key={release.id} className="truncate rounded bg-blue-100 px-1.5 py-1 text-xs text-blue-700">
                        {release.title}
                      </p>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CalendarPreview;
