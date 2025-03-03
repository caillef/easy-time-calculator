
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { refreshDiscordUsers } from '@/services/discordService';
import { useToast } from '@/hooks/use-toast';

const RefreshDiscordButton = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const success = await refreshDiscordUsers();
      
      if (success) {
        toast({
          title: "Discord users refreshed",
          description: "Discord user information has been updated.",
        });
      } else {
        toast({
          title: "Refresh failed",
          description: "Could not refresh Discord user information.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error refreshing Discord users:', error);
      toast({
        title: "Error",
        description: "An error occurred while refreshing Discord user information.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRefresh} 
      disabled={isRefreshing}
    >
      {isRefreshing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Refreshing...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Discord
        </>
      )}
    </Button>
  );
};

export default RefreshDiscordButton;
