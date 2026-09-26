function StatusAlert({ type = 'warning', message }) {
  if (!message) return null;

  const styles = {
    warning:
      'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200',
    error:
      'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200',
    success:
      'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200',
  };

  const icons = {
    warning: '⚠️',
    error: '❌',
    success: '✅',
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-2.5 p-3 rounded-lg border text-sm ${
        styles[type] || styles.warning
      }`}
    >
      <span className="shrink-0">{icons[type] || 'ℹ️'}</span>
      <span className="font-medium">{message}</span>
    </div>
  );
}

export default StatusAlert;
