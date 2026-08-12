type FilterChipsProps = {
  filters: string[];
  selected: string;
  onSelect: (filter: string) => void;
  ariaLabel?: string;
};

/**
 * Compact filter chip row matching company-dashboard density.
 */
export default function FilterChips({
  filters,
  selected,
  onSelect,
  ariaLabel = "Filters",
}: FilterChipsProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-2"
    >
      {filters.map((filter) => {
        const isActive = selected === filter;
        return (
          <button
            key={filter}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(filter)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40 ${
              isActive
                ? "bg-[#ed662e] text-white shadow-sm"
                : "bg-white text-gray-600 border border-orange-100 hover:border-[#ed662e]/50 hover:text-[#ed662e]"
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
