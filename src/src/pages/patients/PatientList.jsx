import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Plus, 
  Search, 
  Loader2, 
  UserPlus,
  FileText,
  CreditCard,
  Edit2,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';
import { useState } from 'react';
import PatientForm from './PatientForm';

export default function PatientList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState(null);
  const queryClient = useQueryClient();

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['patients']);
    }
  });

  const filteredPatients = patients?.filter(patient => 
    patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patient_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  );

  const handleEdit = (id) => {
    setEditingPatientId(id);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingPatientId(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Pacientes</h2>
            <p className="text-slate-500 text-sm">Administra la base de datos de tus pacientes</p>
          </div>
        </div>
        
        <button 
          onClick={handleCreate}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-100 shrink-0"
        >
          <Plus size={20} />
          <span>Nuevo Paciente</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Buscar por nombre o código..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Paciente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nacimiento</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Facturación</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-slate-400 text-sm">Cargando pacientes...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPatients?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <UserPlus className="w-12 h-12 text-slate-200" />
                      <p className="text-slate-500 font-medium">No se encontraron pacientes</p>
                      <p className="text-slate-400 text-sm">Prueba con otra búsqueda o agrega un nuevo paciente.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPatients?.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-tight">
                        {patient.patient_code || '---'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold text-slate-900 line-clamp-1">{patient.full_name}</div>
                        <div className="flex flex-col gap-0.5">
                          {patient.email && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Mail size={12} className="shrink-0" />
                              <span className="truncate max-w-[180px]">{patient.email}</span>
                            </div>
                          )}
                          {patient.phone && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Phone size={12} className="shrink-0" />
                              <span>{patient.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString() : 'No definido'}
                    </td>
                    <td className="px-6 py-4">
                      {patient.requires_invoice ? (
                        <span className="flex items-center gap-1.5 text-blue-600 font-medium text-xs">
                          <FileText size={14} /> Requiere
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">No requiere</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 font-bold text-sm ${patient.credit_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <CreditCard size={14} />
                        ${Number(patient.credit_balance).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(patient.id)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(patient.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <PatientForm 
          patientId={editingPatientId}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            queryClient.invalidateQueries(['patients']);
          }}
        />
      )}
    </>
  );
}
