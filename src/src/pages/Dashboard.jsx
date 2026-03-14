import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, User, LayoutDashboard, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
             <Calendar className="w-5 h-5 text-white" />
           </div>
           <h1 className="font-bold text-xl text-slate-800 tracking-tight">Gestión Clínica</h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
             <User className="w-4 h-4 text-slate-400" />
             <span className="font-medium">{user?.email}</span>
           </div>
           <button 
             onClick={handleLogout}
             className="text-slate-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
             title="Cerrar sesión"
           >
             <LogOut className="w-5 h-5" />
           </button>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
         <div className="flex items-center gap-3 mb-8">
            <LayoutDashboard className="w-8 h-8 text-slate-800" />
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Panel Principal</h2>
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="max-w-xl">
               <h3 className="text-xl font-semibold mb-3 text-slate-900">Bienvenido al Sistema</h3>
               <p className="text-slate-600 leading-relaxed mb-6">
                  Tu cuenta está autorizada y el calendario de Google ha sido sincronizado exitosamente. El sistema está listo para operar completamente.
               </p>
               <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 Sistema Operativo
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
