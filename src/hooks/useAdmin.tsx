import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface AdminData {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export function useAdmin(): AdminData {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setIsAdmin(!!data);
        setError(null);
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError(err.message);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading, error };
}

export async function makeUserAdmin(userId: string) {
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role: 'admin' });

  if (error) {
    throw error;
  }
}