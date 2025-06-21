import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({ 
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  if (error) throw error;
  return data;
}

export async function upsertUserProfile(user: User | null) {
  if (!user) return;
  const { id, user_metadata } = user;
  const { full_name, email } = user_metadata;
  // Upsert user profile
  const { error } = await supabase.from('users').upsert({
    id,
    name: full_name,
    email
  });
  if (error) throw error;
} 
