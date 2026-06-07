import { useState } from 'react';
import { Home, FileText, Bell, Phone, ClipboardList, Settings, MapPin } from 'lucide-react';
import spLogo from '../assets/safepulse-icon.png';

const navItems = [
  {
    id: 'dashboard',
    icon: Home,
    label: 'Dashboard',
    active: false
  },
  {
    id: 'incidents',
    icon: MapPin,
    label: 'Incidents'
  },
  {
    id: 'reports',
    icon: FileText,
    label: 'Reports'
  },
  {
    id: 'alerts',
    icon: Bell,
    label: 'Alerts'
  },
  {
    id: 'support-directory',
    icon: Phone,
    label: 'Support Directory'
  },
  {
    id: 'activity-log',
    icon: ClipboardList,
    label: 'Activity log'
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings'
  },

];

function Sidebar() {
  const [currentPage, setCurrentPage] = useState(
    navItems.find((item) => item.active)?.id || navItems[0]?.id
  );

  const onPageChange = (id) => {
    setCurrentPage(id);
  };
  return (
    <aside className="w-52 min-h-screen bg-emerald-900 flex flex-col pt-0.5 pb-8 shrink-0">
              <div className='flex items-center justify-between h-20 px-4'>
           <div className='flex items-center space-x-4'>
              <div className='relative'>
                <div className='w-12 h-12 bg-linear-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-2xl overflow-hidden'>
                  <img 
                  src={spLogo} 
                  alt='icon' 
                  className='w-12 h-12 rounded-full' />
                </div>
              </div>
                <div>
                  <h1 className='text-xl font-semibold bg-linear-to-r from-white to-emerald-700 
                  bg-clip-text text-transparent'>
                    SafePulse
                  </h1>
                </div>
              
           </div>
        </div>

      <nav className='flex-1 p-4 py-6 whitespace-nowrap space-y-2 overflow-y-auto'>
            {navItems.map((item) => {
                return (
                    <div key={item.id}>
                        <button 
                        className={`w-full flex items-center justify-between p-3 rounded-xl 
                        transition-all duration-200 ${currentPage === item.id || item.active 
                          ? 'bg-linear-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/25'
                          : 'text-white hover:bg-emerald-700 hover:text-white' 
                        }`} onClick={() => onPageChange(item.id)}
                        >
                            <div className='flex items-center space-x-3 cursor-pointer'>
                                <item.icon className={`w-5 h-5`} />

                                {/* Conditional Rendering */}
                                <>
                                    <span className='text-sm font-medium ml-2'>{item.label}</span>
                                    {item.badge && (
                                        <span className='bg-teal-500 text-white text-xs px-2 py-1 
                                        rounded-full'>
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                                </div>
                        </button>
                        
                    </div>
                );   
            })}
      </nav>

    </aside>
  );
}

export default Sidebar;