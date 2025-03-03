
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { refreshDiscordUsers, fetchDiscordUsers } from '@/services/discordService';
import { toast } from '@/components/ui/use-toast';

const RefreshDiscordButton: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      const success = await refreshDiscordUsers();
      
      if (success) {
        toast({
          title: 'Synchronisation réussie',
          description: 'Les informations Discord ont été mises à jour.',
        });
      } else {
        toast({
          title: 'Échec de la synchronisation',
          description: 'Une erreur est survenue lors de la mise à jour des informations Discord.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error refreshing Discord data:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour des informations Discord.',
        variant: 'destructive',
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
      className="flex gap-2 items-center"
    >
      {isRefreshing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      Synchroniser Discord
    </Button>
  );
};

export default RefreshDiscordButton;
