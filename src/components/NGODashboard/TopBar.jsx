import { SearchIcon, BellIcon } from "../shared/Icons";

function TopBar({ bellCount = 0 }) {
  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 shrink-0">
      {/* Search */}
      <div className="flex-1 relative max-w-lg">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon size={15} />
        </span>
        <input
          type="text"
          placeholder="Search incidents, locations or reports..."
          className="
            w-full pl-9 pr-4 py-2.5
            bg-gray-50 border border-gray-200 rounded-xl
            text-sm text-gray-700 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400
            transition-all font-sans
          "
        />
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Bell */}
        <div className="relative">
          <button className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
            <BellIcon size={18} />
          </button>
          {bellCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {bellCount > 99 ? "99+" : bellCount}
            </span>
          )}
        </div>

        {/* Admin */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="w-9 h-9 bg-green-700 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">Admin</p>
            <p className="text-xs text-gray-400">NGO Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;