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
    <div className="flex space-x-1 mb-6">
      <button
        onClick={() => onTabChange('classes')}
        className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
          activeTab === 'classes'
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Classes ({classesCount})
      </button>
      <button
        onClick={() => onTabChange('events')}
        className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
          activeTab === 'events'
            ? 'bg-orange-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Events ({eventsCount})
      </button>
    </div>
  );
}
