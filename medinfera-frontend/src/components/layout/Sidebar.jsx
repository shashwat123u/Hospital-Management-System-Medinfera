import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NAV_CONFIG } from '../../utils/roleConfig';
import { Menu, X } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { RoleBadge } from '../shared/RoleBadge';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const navItems = NAV_CONFIG[user?.role] || [];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 bg-slate-950/50 flex-shrink-0">
          <div className="flex items-center gap-2 text-primary-500 font-bold text-xl tracking-tight">
            <img src="/medinfera-logo.svg" alt="" className="w-9 h-9 object-contain" />
            <span className="text-white">MedInfera</span>
          </div>
          <button 
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Avatar alt={`${user?.firstName} ${user?.lastName}`} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <RoleBadge role={user?.role} className="mt-1 transform scale-90 origin-left" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
