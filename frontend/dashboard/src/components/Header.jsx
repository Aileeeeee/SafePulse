import { useState } from 'react';
import { Search, Bell, ChevronDown, User, LogOut } from 'lucide-react';

export default function Header({ searchQuery, onSearchChange, newReportsCount, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      <div className="relative w-100">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search incidents, locations or reports..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent placeholder:text-gray-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-600" />
          {newReportsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
              {newReportsCount > 9 ? '9+' : newReportsCount}
            </span>
          )}
        </button>

        <div className="relative flex items-center space-x-3 pl-3 border-l border-slate-200">
          <img
            src="https://avatars.githubusercontent.com/u/12345678?v=4"
            alt="User Avatar"
            className="w-8 h-8 rounded-full ring-2 ring-emerald-500"
          />
          <div className="hidden md:block">
            <p className="text-sm font-medium text-black-500">David</p>
            <p className="text-xs text-slate-500">NGO Administrator</p>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center cursor-pointer">
            <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-10 w-48 bg-white border rounded-lg shadow-lg z-50">
              <button
                className="flex items-center w-full gap-2 px-4 py-3 text-left hover:bg-gray-100"
                onClick={() => console.log("Profile")}
              >
                <User size={18} />
                Profile
              </button>
            
              <button
                className="flex items-center w-full gap-2 px-4 py-3 text-left text-red-600 hover:bg-red-50"
                onClick={onLogout}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}