import { supabase } from './supabase';

export const callMyAiApi = async ({ symbol, message, script_context }) => {
  // Kita memanggil Edge Function yang kita beri nama 'analyze-code'
  const { data, error } = await supabase.functions.invoke('analyze-code', {
    body: { 
      symbol, 
      message, 
      context: script_context 
    },
  });

  if (error) throw error;
  return data; // Mengembalikan jawaban dari AI
};