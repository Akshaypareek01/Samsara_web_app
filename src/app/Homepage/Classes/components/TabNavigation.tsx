"use client";

interface TabNavigationProps {
  activeTab: "classes" | "events";
  onTabChange: (tab: "classes" | "events") => void;
  classesCount: number;
  eventsCount: number;
}

/**
 * Segmented Classes / Events tabs for My Classes.
 */
export default function TabNavigation({
  activeTab,
  onTabChange,
  classesCount,
  eventsCount,
}: TabNavigationProps) {
  return (
    <div
      role="tablist"
      aria-label="Booked items"
      className="flex gap-1 mb-4 bg-orange-50/80 p-1 rounded-lg border border-orange-100/80"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "classes"}
        onClick={() => onTabChange("classes")}
        className={`flex-1 px-3 sm:px-5 py-2.5 text-sm font-medium rounded-md transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 ${
          activeTab === "classes"
            ? "bg-white text-orange-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Classes ({classesCount})
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "events"}
        onClick={() => onTabChange("events")}
        className={`flex-1 px-3 sm:px-5 py-2.5 text-sm font-medium rounded-md transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1 ${
          activeTab === "events"
            ? "bg-white text-orange-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Events ({eventsCount})
      </button>
    </div>
  );
}
