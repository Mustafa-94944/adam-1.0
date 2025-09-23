import { supabase } from '../utils/supabase';

export async function saveChatMessage(content: string, isUser: boolean, timestamp: Date, sources?: any) {
  const { error } = await supabase.from('chat_messages').insert([
    {
      content,
      is_user: isUser,
      timestamp,
      sources: sources ? JSON.stringify(sources) : null,
    },
  ]);
  if (error) throw error;
}
