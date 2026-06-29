import { useState } from 'react';
import { Search, Bell, ChevronDown, User, LogOut, Menu } from 'lucide-react';

export default function Header({ searchQuery, onSearchChange, newReportsCount, onLogout, onMenuClick, userName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 shrink-0 gap-2">
      {/* Hamburger — mobile/tablet only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Search — full width on desktop, icon-toggle on mobile */}
      <div className="hidden sm:block relative w-full max-w-xs lg:max-w-100">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search incidents, locations or reports..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent placeholder:text-gray-400"
        />
      </div>

      {/* Mobile search toggle */}
      <button
        onClick={() => setMobileSearchOpen((v) => !v)}
        className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label="Search"
      >
        <Search size={18} />
      </button>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} className="text-gray-600" />
          {newReportsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
              {newReportsCount > 9 ? '9+' : newReportsCount}
            </span>
          )}
        </button>

        <div className="relative flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-semibold ring-2 ring-emerald-500">
            {userName?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-black">{userName || 'Admin'}</p>
            <p className="text-xs text-slate-500">NGO Administrator</p>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="flex items-center cursor-pointer">
            <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-10 w-32 bg-white border rounded-lg shadow-lg z-50">
              <button
                className="flex items-center w-full gap-2 px-4 py-3 text-left hover:bg-gray-100"
                onClick={() => console.log('Profile')}
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

      {/* Mobile search bar — slides below header when toggled */}
      {mobileSearchOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-gray-100 px-3 py-2.5 sm:hidden z-30 shadow-sm">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search incidents, locations or reports..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent placeholder:text-gray-400"
            />
          </div>
        </div>
      )}
    </header>
  );
}