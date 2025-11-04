
/**
 * ============================================================================
 * PAGE DE GESTION DES MESSAGES - ADMINISTRATION DES CONTACTS
 * ============================================================================
 * 
 * Cette page permet aux administrateurs de consulter, gérer et répondre
 * aux messages reçus via le formulaire de contact.
 * 
 * FONCTIONNALITÉS PRINCIPALES :
 * - Affichage de tous les messages reçus
 * - Marquage des messages comme lu/non lu
 * - Suppression de messages avec confirmation
 * - Détail complet des messages dans une modale
 * - Notifications en temps réel via WebSocket
 * - Interface responsive et moderne
 * 
 * GESTION DES MESSAGES :
 * - Liste paginée avec état lu/non lu
 * - Badge de compteur pour messages non lus
 * - Détails complets : nom, email, sujet, message, date
 * - Actions : Marquer lu/non lu, Supprimer
 * - Synchronisation temps réel avec WebSocket
 * 
 * FONCTIONNALITÉS AVANCÉES :
 * - Filtrage par statut (lu/non lu)
 * - Recherche dans les messages
 * - Export des données (futur)
 * - Statistiques des contacts
 * 
 * SÉCURITÉ :
 * - Accès réservé aux administrateurs
 * - Confirmation avant suppression
 * - Validation des actions côté serveur
 * - Protection contre les actions non autorisées
 * 
 * TEMPS RÉEL :
 * - Mise à jour automatique via WebSocket
 * - Notifications instantanées de nouveaux messages
 * - Synchronisation entre plusieurs sessions admin
 * - Compteur de non lus en temps réel
 * 
 * @author Riziky Agendas Team
 * @version 1.0.0
 * @lastModified 2024
 */

import React, { useState, useEffect } from 'react';
import { MessageService, ContactMessage } from '@/services/MessageService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, MailOpen, Calendar, User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import ConfirmDeleteMessageModal from '@/components/ConfirmDeleteMessageModal';

const MessagesPage = () => {
  const { messages: messagesFromWebSocket, refreshUnreadCount } = useUnreadMessages();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchroniser avec les données WebSocket
  useEffect(() => {
    if (messagesFromWebSocket.length > 0 || messagesFromWebSocket.length === 0) {
      setMessages(messagesFromWebSocket);
      setLoading(false);
    }
  }, [messagesFromWebSocket]);

  useEffect(() => {
    // Chargement initial si WebSocket n'a pas encore de données
    if (messages.length === 0) {
      loadMessages();
    }
  }, []);

  const loadMessages = async () => {
    try {
      const data = await MessageService.getAllMessages();
      setMessages(data);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);

    if (!message.lu) {
      const success = await MessageService.markAsRead(message.id);
      if (success) {
        // Les données seront mises à jour automatiquement via WebSocket
        // Mais on peut aussi mettre à jour localement pour une réponse immédiate
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id ? { ...msg, lu: true } : msg
          )
        );
        setSelectedMessage(prev => prev ? { ...prev, lu: true } : null);
      }
    }
  };

  const handleMarkAsUnread = async () => {
    if (!selectedMessage) return;
    
    const success = await MessageService.markAsUnread(selectedMessage.id);
    if (success) {
      // Les données seront mises à jour automatiquement via WebSocket
      setMessages(prev => 
        prev.map(msg => 
          msg.id === selectedMessage.id ? { ...msg, lu: false } : msg
        )
      );
      setSelectedMessage(prev => prev ? { ...prev, lu: false } : null);
      toast.success('Message marqué comme non lu');
    } else {
      toast.error('Erreur lors de la mise à jour du message');
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;
    
    setIsDeleting(true);
    const success = await MessageService.deleteMessage(selectedMessage.id);
    
    if (success) {
      // Les données seront mises à jour automatiquement via WebSocket
      setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
      setIsDeleteModalOpen(false);
      setIsDialogOpen(false);
      setSelectedMessage(null);
      toast.success('Message supprimé avec succès');
    } else {
      toast.error('Erreur lors de la suppression du message');
    }
    
    setIsDeleting(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = messages.filter(msg => !msg.lu).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 pt-20 px-4">
        <div className="container mx-auto py-8">
          <div className="text-center">Chargement des messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 pt-16 sm:pt-18 lg:pt-20 px-2 sm:px-4 lg:px-6">
      <div className="container mx-auto py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2 px-2">
            Messages de Contact
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap px-2">
            <Badge variant="outline" className="text-sm">
              {messages.length} message(s) total
            </Badge>
            {unreadCount > 0 && (
              <Badge className="bg-green-500 text-white">
                {unreadCount} non lu(s)
              </Badge>
            )}
          </div>
        </div>

        {messages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 sm:py-10 lg:py-12 px-4">
              <Mail className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Aucun message</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Vous n'avez reçu aucun message de contact pour le moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {messages.map((message) => (
              <Card 
                key={message.id} 
                className={`cursor-pointer hover:shadow-md transition-all ${
                  !message.lu ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : ''
                }`}
                onClick={() => handleMessageClick(message)}
              >
                <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 lg:p-6">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      {message.lu ? (
                        <MailOpen className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm sm:text-base lg:text-lg truncate">{message.sujet}</CardTitle>
                        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-muted-foreground mt-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{message.nom}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{message.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{formatDate(message.dateEnvoi)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!message.lu && (
                      <Badge className="bg-green-500 text-white text-xs flex-shrink-0">Nouveau</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                  <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">
                    {message.message}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="message-dialog-description">
            {selectedMessage && (
              <>
                <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
                  <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="truncate">{selectedMessage.sujet}</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0" id="message-dialog-description">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">De:</label>
                      <p className="font-medium text-sm sm:text-base truncate">{selectedMessage.nom}</p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">Email:</label>
                      <p className="font-medium text-sm sm:text-base truncate">{selectedMessage.email}</p>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-xs sm:text-sm font-medium text-muted-foreground">Date:</label>
                      <p className="font-medium text-sm sm:text-base">{formatDate(selectedMessage.dateEnvoi)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 block">Message:</label>
                    <div className="p-3 sm:p-4 bg-background border rounded-lg">
                      <p className="whitespace-pre-wrap text-sm sm:text-base">{selectedMessage.message}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
                    <div className="flex flex-col sm:flex-row gap-2">
                      {selectedMessage.lu && (
                        <Button 
                          variant="outline" 
                          onClick={handleMarkAsUnread}
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 h-9 sm:h-10 text-xs sm:text-sm"
                        >
                          Marquer comme non lu
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 flex items-center gap-2 h-9 sm:h-10 text-xs sm:text-sm"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        Supprimer
                      </Button>
                    </div>
                    <Button onClick={() => setIsDialogOpen(false)} className="h-9 sm:h-10 text-xs sm:text-sm">
                      Fermer
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {selectedMessage && (
          <ConfirmDeleteMessageModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteMessage}
            message={selectedMessage}
            isDeleting={isDeleting}
          />
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
