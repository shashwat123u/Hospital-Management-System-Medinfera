import React, { useState } from 'react';

export const Tabs = ({ tabs, defaultTab, onChange, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (id) => {
    setActiveTab(id);
    if (onChange) onChange(id);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive 
                  ? 'border-primary-600 text-primary-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab.icon && <tab.icon className={`w-4 h-4 mr-2 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />}
              {tab.label}
              {tab.badge && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  isActive ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="py-4">
        {tabs.find((t) => t.id === activeTab)?.content}
      </div>
    </div>
  );
};
