import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NotificationPanel } from '../shared/NotificationPanel';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { Avatar } from '../ui/Avatar';
import { useNavigate } from 'react-router-dom';

export const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userMenuTrigger = (
    <div className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-xl transition-colors">
      <Avatar alt={user?.firstName} size="sm" />
    </div>
  );

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden sm:block">
          {user?.hospitalName ? (
            <h1 className="text-sm font-semibold text-slate-800">{user.hospitalName}</h1>
          ) : (
            <h1 className="text-sm font-medium text-slate-500">Welcome back, {user?.firstName}</h1>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationPanel />
        
        <div className="w-px h-6 bg-slate-200 mx-2" />

        <Dropdown trigger={userMenuTrigger}>
          <div className="px-4 py-2 border-b border-slate-50">
            <p className="text-sm font-medium text-slate-800">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <DropdownItem icon={User} onClick={() => navigate('/settings/password')}>
            Change Password
          </DropdownItem>
          <DropdownItem icon={LogOut} onClick={logout} className="text-red-600 hover:bg-red-50 hover:text-red-700">
            Logout
          </DropdownItem>
        </Dropdown>
      </div>
    </header>
  );
};
