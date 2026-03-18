import { LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
          <LayoutDashboard className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Panel Principal</h2>
          <p className="text-slate-500 text-sm">Resumen general y estado del sistema</p>
        </div>
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
    </>
  );
}
