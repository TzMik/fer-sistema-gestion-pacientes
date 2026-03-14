import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, LogIn, KeyRound, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

export default function Login() {
  const { user, isAuthorized, isSetupComplete, loading, session, checkAuthorization } = useAuth();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Mutation to save Google tokens in authorized_users table
  const setupMutation = useMutation({
    mutationFn: async ({ email, providerId, providerToken, authUserId }) => {
      const { error: updateError } = await supabase
        .from('authorized_users')
        .update({
          google_user_id: providerId,
          calendar_refresh_token: providerToken,
          auth_user_id: authUserId
        })
        .eq('email', email);

      if (updateError) throw updateError;
      return true;
    },
    onSuccess: async () => {
      // Re-verify auth state globally through context
      await checkAuthorization(user);
      navigate('/', { replace: true });
    },
    onError: (err) => {
      console.error("Error updating tokens:", err);
      setError("Error al guardar la configuración. Asegúrate de tener permisos.");
    }
  });

  useEffect(() => {
    // If user is authorized but lacks setup, look for tokens in the return session
    if (user && isAuthorized && !isSetupComplete && !loading && !setupMutation.isPending) {
      const providerToken = session?.provider_refresh_token; 
      const providerId = user?.user_metadata?.provider_id || user?.user_metadata?.sub;
      
      if (providerToken && providerId) {
        setupMutation.mutate({ 
          email: user.email, 
          providerId, 
          providerToken,
          authUserId: user.id
        });
      }
    }
  }, [user, isAuthorized, isSetupComplete, session, loading, setupMutation, navigate]);

  const handleLogin = async (forceConsent = false) => {
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/login',
        scopes: 'https://www.googleapis.com/auth/calendar.readonly',
        queryParams: forceConsent ? {
          access_type: 'offline',
          prompt: 'consent',
        } : {
          access_type: 'offline'
        }
      }
    });

    if (error) setError(error.message);
  };

  if (loading || setupMutation.isPending) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-slate-900" />
      </div>
    );
  }

  // Rest of the UI remains the same...
  if (user && isAuthorized && isSetupComplete) {
    return <Navigate to="/" replace />;
  }

  if (user && !isAuthorized && !loading) {
     return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shadow-inner">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-1">
               <h2 className="text-2xl font-bold text-slate-900">Acceso Denegado</h2>
               <p className="text-slate-500 text-sm">
                 La cuenta <span className="font-medium text-slate-700">{user.email}</span> no está autorizada para acceder al sistema.
               </p>
            </div>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Cerrar Sesión y Volver
            </button>
          </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 space-y-8">
          <div className="text-center space-y-3">
             <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-blue-100">
                <Calendar className="w-10 h-10 text-blue-600" />
             </div>
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión Clínica</h1>
             <p className="text-slate-500">
                {user && isAuthorized && !isSetupComplete 
                  ? "Configuración inicial requerida"
                  : "Por favor, inicia sesión para continuar"}
             </p>
          </div>

          {(error || setupMutation.isError) && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error || "Error al completar el registro."}</p>
            </div>
          )}

          {user && isAuthorized && !isSetupComplete ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 space-y-2">
                 <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                   <KeyRound className="w-4 h-4" />
                   Permisos Necesarios
                 </h3>
                 <p className="text-sm text-blue-800/80 leading-relaxed">
                   Para continuar, otorga permisos de lectura obligatorios a tu Google Calendar. Esto permite sincronizar las citas automáticamente con la base de datos.
                 </p>
               </div>
               <div className="space-y-3">
                  <button
                     onClick={() => handleLogin(true)}
                     className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-all font-medium focus:ring-4 focus:ring-blue-100 shadow-md hover:shadow-lg hover:-translate-y-0.5 duration-200"
                   >
                     <Calendar className="w-5 h-5" />
                     Conectar Google Calendar
                   </button>
                   <button
                     onClick={() => supabase.auth.signOut()}
                     className="w-full text-slate-500 hover:text-slate-700 py-3 text-sm font-medium transition-colors rounded-xl hover:bg-slate-50"
                   >
                     Cancelar y cerrar sesión
                   </button>
               </div>
            </div>
          ) : (
            <div className="space-y-6">
                <button
                  onClick={() => handleLogin(false)}
                  className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 px-4 rounded-xl hover:bg-slate-800 transition-all font-medium focus:ring-4 focus:ring-slate-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 duration-200"
                >
                  <LogIn className="w-5 h-5" />
                  Iniciar Sesión con Google
                </button>
            </div>
          )}
        </div>
        {!user && (
           <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
              <p className="text-xs text-slate-400">Protegido y seguro con Google</p>
           </div>
        )}
      </div>
    </div>
  );
}
