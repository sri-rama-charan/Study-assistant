function ResponsePreview({ response }) {
  if (!response) return null;

  return (
    <section className="mt-6 p-5 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/20 dark:border-emerald-800 text-left">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
          Backend Response
        </h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 font-mono font-semibold">
          HTTP 200 OK
        </span>
      </div>

      <p className="text-sm text-emerald-700 dark:text-emerald-200 mb-3 font-medium">
        {response.message}
      </p>

      <pre className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 overflow-x-auto shadow-inner">
        {JSON.stringify(response, null, 2)}
      </pre>
    </section>
  );
}

export default ResponsePreview;
