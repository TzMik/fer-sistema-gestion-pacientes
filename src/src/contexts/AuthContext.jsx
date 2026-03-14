import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAuthorization(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAuthorization(session.user);
      } else {
        setIsAuthorized(false);
        setIsSetupComplete(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthorization = async (user) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('authorized_users')
        .select('*')
        .eq('email', user.email)
        .single();
        
      if (error || !data) {
        setIsAuthorized(false);
        setIsSetupComplete(false);
        // Force signout if not authorized
        await supabase.auth.signOut();
      } else {
        setIsAuthorized(true);
        // User is setup if tokens exist
        if (data.google_user_id && data.calendar_refresh_token) {
          setIsSetupComplete(true);
        } else {
          setIsSetupComplete(false);
        }
      }
    } catch (e) {
      console.error("Error checking authorization:", e);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAuthorized, isSetupComplete, checkAuthorization }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
