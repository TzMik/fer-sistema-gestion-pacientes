import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Panel Principal', path: '/dashboard' },
  { icon: Users, label: 'Pacientes', path: '/patients' },
  { icon: Calendar, label: 'Citas', path: '/appointments' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={`bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col h-screen sticky top-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-6 flex items-center justify-between">
        <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'} transition-all duration-300`}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight whitespace-nowrap">
            Gestión Clínica
          </span>
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
            `}
          >
            <item.icon className={`w-5 h-5 shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
            
            {isCollapsed && (
              <div className="fixed left-20 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all group ${isCollapsed ? 'justify-center' : ''}`}>
          <Settings className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Configuración</span>}
          {isCollapsed && (
            <div className="fixed left-20 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Configuración
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
