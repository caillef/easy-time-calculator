
import { supabase } from "@/integrations/supabase/client";

export interface DiscordUser {
  id: string;
  name: string;
  discord_user_id: string;
  username: string | null;
  avatar: string | null;
}

export const fetchDiscordUsers = async (): Promise<DiscordUser[]> => {
  try {
    const { data, error } = await supabase
      .from('discord_users')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching discord users:', error);
    return [];
  }
};

export const getDiscordAvatarUrl = (userId: string, avatarId: string | null): string => {
  if (!avatarId) {
    // Default Discord avatar if no custom avatar
    return `https://cdn.discordapp.com/embed/avatars/0.png`;
  }
  
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarId}.png`;
};

export const refreshDiscordUsers = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-discord-users');
    
    if (error) {
      throw error;
    }
    
    return data?.success || false;
  } catch (error) {
    console.error('Error refreshing discord users:', error);
    return false;
  }
};
