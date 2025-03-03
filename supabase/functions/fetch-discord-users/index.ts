
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Get Discord token from environment
    const discordBotToken = Deno.env.get('DISCORD_BOT_TOKEN')
    if (!discordBotToken) {
      throw new Error('DISCORD_BOT_TOKEN is not set')
    }
    
    // Get all users from our discord_users table
    const { data: discordUsers, error: fetchError } = await supabaseClient
      .from('discord_users')
      .select('id, name, discord_user_id')
    
    if (fetchError) throw fetchError
    if (!discordUsers) throw new Error('No discord users found')
    
    console.log(`Found ${discordUsers.length} discord users to update`)
    
    // For each user, fetch data from Discord API and update our table
    for (const user of discordUsers) {
      try {
        // Fetch user info from Discord API
        const discordResponse = await fetch(
          `https://discord.com/api/v10/users/${user.discord_user_id}`,
          {
            headers: {
              Authorization: `Bot ${discordBotToken}`,
            },
          }
        )
        
        if (!discordResponse.ok) {
          const errorText = await discordResponse.text()
          console.error(`Error fetching Discord user ${user.discord_user_id}: ${discordResponse.status} ${errorText}`)
          continue
        }
        
        const discordData = await discordResponse.json()
        console.log(`Fetched Discord data for ${discordData.username} (${user.name})`)
        
        // Update user in our database
        const { error: updateError } = await supabaseClient
          .from('discord_users')
          .update({
            username: discordData.username,
            avatar: discordData.avatar,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
        
        if (updateError) {
          console.error(`Error updating user ${user.name}: ${updateError.message}`)
        }
      } catch (error) {
        console.error(`Error processing user ${user.name}: ${error.message}`)
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Discord users updated successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error(`Error in fetch-discord-users function: ${error.message}`)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
