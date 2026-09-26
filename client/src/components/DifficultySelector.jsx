const DIFFICULTY_OPTIONS = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

function DifficultySelector({ value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
        Difficulty:
      </label>
      <div className="flex flex-wrap gap-2.5">
        {DIFFICULTY_OPTIONS.map((option) => {
          const isSelected = value === option.id;
          return (
            <label
              key={option.id}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-500 dark:text-indigo-300'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="difficulty"
                value={option.id}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default DifficultySelector;
