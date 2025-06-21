import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wpnahamvfvcphtdbhsdb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwbmFoYW12ZnZjcGh0ZGJoc2RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTY2ODAsImV4cCI6MjA2NTk5MjY4MH0.Db-aL3dwokHbzX-lBTn314DiVrm5zMYaShREIYVQYuc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}); 