import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({ trigger, children, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`absolute z-50 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150 ${
            align === 'right' ? 'origin-top-right right-0' : 'origin-top-left left-0'
          }`}
        >
          <div className="py-1" onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, icon: Icon, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors ${className}`}
  >
    {Icon && <Icon className="mr-3 h-4 w-4 text-slate-400" />}
    {children}
  </button>
);
