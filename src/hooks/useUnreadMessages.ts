
import { useState, useEffect } from 'react';
import { MessageService } from '@/services/MessageService';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const messages = await MessageService.getAllMessages();
      const count = messages.filter(msg => !msg.lu).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur lors du chargement des messages non lus:', error);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    
    // Rafraîchir le compteur toutes les 30 secondes
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshUnreadCount = () => {
    loadUnreadCount();
  };

  return {
    unreadCount,
    refreshUnreadCount
  };
};
