"use client";

import { Search } from "lucide-react";

export type ListingFilterBarProps = {
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  dayOptions: readonly string[];
  daySelected: string;
  onDaySelect: (value: string) => void;
  levelOptions: string[];
  levelSelected: string;
  onLevelSelect: (value: string) => void;
  typeOptions: string[];
  typeSelected: string;
  onTypeSelect: (value: string) => void;
  typeLabel?: string;
  resultCount: number;
  resultNoun: string;
  onClear: () => void;
};

/**
 * Company-style listing filter panel: search, When chips, Level/Format selects.
 */
export default function ListingFilterBar({
  searchValue,
  searchPlaceholder,
  onSearchChange,
  dayOptions,
  daySelected,
  onDaySelect,
  levelOptions,
  levelSelected,
  onLevelSelect,
  typeOptions,
  typeSelected,
  onTypeSelect,
  typeLabel = "Format",
  resultCount,
  resultNoun,
  onClear,
}: ListingFilterBarProps) {
  const hasActive =
    daySelected !== "All" ||
    levelSelected !== "All" ||
    typeSelected !== "All" ||
    searchValue.trim().length > 0;

  const levelSelectOptions = levelOptions.filter((o) => o !== "All");
  const typeSelectOptions = typeOptions.filter((o) => o !== "All");

  return (
    <section
      className="rounded-xl border border-[#ffe0d0] bg-white p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-4"
      aria-label="Filters"
    >
      <div>
        <label
          htmlFor="listing-filter-search"
          className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5"
        >
          Search
        </label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={16}
            aria-hidden
          />
          <input
            id="listing-filter-search"
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-[#e5e7eb] bg-white pl-9 pr-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ed662e]/35 focus:border-[#ed662e]"
          />
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
          When
        </p>
        <div
          role="group"
          aria-label="Date filters"
          className="flex flex-wrap gap-2"
        >
          {dayOptions.map((day) => {
            const active = daySelected === day;
            return (
              <button
                key={day}
                type="button"
                aria-pressed={active}
                onClick={() => onDaySelect(day)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium min-h-[34px] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40 ${
                  active
                    ? "bg-[#ed662e] text-white shadow-sm"
                    : "bg-[#fff4ef] text-gray-700 border border-[#ffe0d0] hover:border-[#ed662e]/50 hover:text-[#ed662e]"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {(levelSelectOptions.length > 0 || typeSelectOptions.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {levelSelectOptions.length > 0 ? (
            <div>
              <label
                htmlFor="listing-filter-level"
                className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5"
              >
                Level
              </label>
              <select
                id="listing-filter-level"
                value={levelSelected}
                onChange={(e) => onLevelSelect(e.target.value)}
                className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ed662e]/35 focus:border-[#ed662e]"
                aria-label="Filter by level"
              >
                <option value="All">All levels</option>
                {levelSelectOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {typeSelectOptions.length > 0 ? (
            <div>
              <label
                htmlFor="listing-filter-type"
                className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5"
              >
                {typeLabel}
              </label>
              <select
                id="listing-filter-type"
                value={typeSelected}
                onChange={(e) => onTypeSelect(e.target.value)}
                className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ed662e]/35 focus:border-[#ed662e] capitalize"
                aria-label={`Filter by ${typeLabel.toLowerCase()}`}
              >
                <option value="All">All {typeLabel.toLowerCase()}s</option>
                {typeSelectOptions.map((type) => (
                  <option key={type} value={type} className="capitalize">
                    {type}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#ffe0d0]/80">
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-gray-800">{resultCount}</span>{" "}
          {`${resultNoun}${resultCount === 1 ? "" : "s"}`}
        </p>
        {hasActive ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-[#ed662e] hover:text-[#c95520] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ed662e]/40 rounded"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </section>
  );
}
