function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <strong className="mt-2 block text-2xl text-slate-900 dark:text-slate-100">{value}</strong>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default StatCard;
