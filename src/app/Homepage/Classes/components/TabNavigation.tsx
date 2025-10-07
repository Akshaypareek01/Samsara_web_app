"use client";

interface TabNavigationProps {
  activeTab: 'classes' | 'events';
  onTabChange: (tab: 'classes' | 'events') => void;
  classesCount: number;
  eventsCount: number;
}

export default function TabNavigation({ 
  activeTab, 
  onTabChange, 
  classesCount, 
  eventsCount 
}: TabNavigationProps) {
  return (
    <div className="flex space-x-1 mb-4 sm:mb-6 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onTabChange('classes')}
        className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
          activeTab === 'classes'
            ? 'bg-white text-orange-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <span className="block sm:hidden">Classes</span>
        <span className="hidden sm:block">Classes ({classesCount})</span>
        <span className="block sm:hidden text-xs text-gray-400">({classesCount})</span>
      </button>
      <button
        onClick={() => onTabChange('events')}
        className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
          activeTab === 'events'
            ? 'bg-white text-orange-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <span className="block sm:hidden">Events</span>
        <span className="hidden sm:block">Events ({eventsCount})</span>
        <span className="block sm:hidden text-xs text-gray-400">({eventsCount})</span>
      </button>
    </div>
  );
}
