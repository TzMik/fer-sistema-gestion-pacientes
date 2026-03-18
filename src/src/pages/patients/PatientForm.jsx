import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  X, 
  Save, 
  Loader2, 
  AlertCircle,
  User,
  Calendar,
  FileText,
  CreditCard
} from 'lucide-react';

export default function PatientForm({ patientId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    email: '',
    phone: '',
    requires_invoice: false,
    credit_balance: 0
  });

  useEffect(() => {
    if (patientId) {
      const fetchPatient = async () => {
        setLoading(true);
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();
        
        if (error) {
          setError('No se pudo cargar el paciente');
        } else {
          setFormData({
            full_name: data.full_name || '',
            birth_date: data.birth_date || '',
            email: data.email || '',
            phone: data.phone || '',
            requires_invoice: data.requires_invoice || false,
            credit_balance: data.credit_balance || 0
          });
        }
        setLoading(false);
      };
      fetchPatient();
    }
  }, [patientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (patientId) {
        const { error } = await supabase
          .from('patients')
          .update(formData)
          .eq('id', patientId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('patients')
          .insert([formData]);
        if (error) throw error;
      }
      onSuccess();
    } catch (err) {
      setError(err.message || 'Error al guardar el paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            {patientId ? 'Editar Paciente' : 'Nuevo Paciente'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                  <User size={16} className="text-slate-400" /> Nombre Completo
                </label>
                <input 
                  type="text"
                  name="full_name"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Ej. Juan Pérez"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" /> Fecha de Nacimiento
                </label>
                <input 
                  type="date"
                  name="birth_date"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={formData.birth_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" /> Email
                </label>
                <input 
                  type="email"
                  name="email"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" /> Teléfono
                </label>
                <input 
                  type="tel"
                  name="phone"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="+52 33 3333 3333"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                  <CreditCard size={16} className="text-slate-400" /> Balance Inicial
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input 
                    type="number"
                    step="0.01"
                    name="credit_balance"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={formData.credit_balance}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox"
                    name="requires_invoice"
                    className="peer sr-only"
                    checked={formData.requires_invoice}
                    onChange={handleChange}
                  />
                  <div className="w-10 h-6 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition-all duration-200 peer-focus:ring-4 peer-focus:ring-blue-500/20"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 peer-checked:translate-x-4 shadow-sm"></div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Requiere factura</span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all border border-slate-200"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save size={20} />
              )}
              <span>{patientId ? 'Guardar Cambios' : 'Crear Paciente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
