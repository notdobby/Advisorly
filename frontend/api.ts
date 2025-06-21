import { supabase } from './supabaseClient';

export async function getWallets(userId: string) {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function getTransactions(userId: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function getAISuggestions(userId: string) {
  const { data, error } = await supabase
    .from('ai_suggestions')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
} 