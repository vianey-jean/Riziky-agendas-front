// Importation de la configuration Axios pour les appels API
import api from './api';

// Fonctions utilitaires de date depuis date-fns
import { format, parseISO, addDays, startOfWeek, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale'; // Localisation française pour les formats de date

// Importation du système de notification
import { toast } from 'sonner';

// Service d'authentification pour récupérer l'utilisateur connecté
import { AuthService } from './AuthService';

// Définition de l'interface TypeScript pour un rendez-vous
export interface Appointment {
  lieu: ReactNode;
  id: number;
  userId: number;
  titre: string;
  description: string;
  date: string;
  heure: string;
  duree: number;
  location: string;
}

// Définition du service de gestion des rendez-vous
export const AppointmentService = {

  // Fonction pour récupérer tous les rendez-vous de l'utilisateur courant
  getAll: async (): Promise<Appointment[]> => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) return [];

      const response = await api.get('/appointments', {
        headers: { 'user-id': currentUser.id.toString() }
      });

      return response.data.appointments || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      return [];
    }
  },

  // Fonction pour récupérer un rendez-vous spécifique via son ID
  getById: async (id: number): Promise<Appointment | undefined> => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) return undefined;

      const response = await api.get(`/appointments/${id}`, {
        headers: { 'user-id': currentUser.id.toString() }
      });

      return response.data.appointment;
    } catch (error) {
      console.error(`Erreur lors de la récupération du rendez-vous ${id}:`, error);
      return undefined;
    }
  },

  // Récupérer les rendez-vous de la semaine en cours
  getCurrentWeekAppointments: async (userId?: number): Promise<Appointment[]> => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser && !userId) return [];

      const today = new Date();
      const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
      const endOfCurrentWeek = addDays(startOfCurrentWeek, 6);

      const startDateStr = format(startOfCurrentWeek, 'yyyy-MM-dd');
      const endDateStr = format(endOfCurrentWeek, 'yyyy-MM-dd');

      const response = await api.get(`/appointments/week/${startDateStr}/${endDateStr}`, {
        headers: { 'user-id': (userId || currentUser?.id || 0).toString() }
      });

      const appointments = response.data.appointments || [];
      AppointmentService.checkUpcomingAppointments(appointments);

      return appointments;
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous de la semaine:', error);
      return [];
    }
  },

  // Vérifie si un rendez-vous aura lieu dans les prochaines 24 heures
  checkUpcomingAppointments: (appointments: Appointment[]) => {
    try {
      const now = new Date();

      appointments.forEach(appointment => {
        const appointmentDate = parseISO(`${appointment.date}T${appointment.heure}`);
        const hoursDifference = differenceInHours(appointmentDate, now);

        if (hoursDifference > 23 && hoursDifference <= 24) {
          const formattedDate = format(appointmentDate, 'dd MMMM yyyy', { locale: fr });

          toast.info({
            title: "Rappel de rendez-vous",
            description: `Vous avez un rendez-vous demain: ${appointment.titre} le ${formattedDate} à ${appointment.heure}`,
            action: () => AppointmentService.showAppointmentDetails(appointment)
          });

          AppointmentService.sendEmailReminder(appointment);
        }
      });
    } catch (error) {
      console.error('Erreur lors de la vérification des rendez-vous à venir:', error);
    }
  },

  // Fonction d'affichage (à relier avec le composant UI)
  showAppointmentDetails: (appointment: Appointment) => {
    console.log('Affichage des détails du rendez-vous:', appointment);
  },

  // Envoie un email de rappel pour un rendez-vous
  sendEmailReminder: async (appointment: Appointment) => {
    try {
      await api.post('/appointments/reminder', {
        appointmentId: appointment.id,
        email: 'vianey.jean@ymail.com', // Adresse mail statique ici
      });
      console.log('Email de rappel envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de rappel:', error);
    }
  },

  // Rechercher des rendez-vous avec un mot-clé (min 3 caractères)
  search: async (query: string): Promise<Appointment[]> => {
    if (query.length < 3) return [];

    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) return [];

      const response = await api.get(`/appointments/search/${query}`, {
        headers: { 'user-id': currentUser.id.toString() }
      });

      return response.data.appointments || [];
    } catch (error) {
      console.error('Erreur lors de la recherche de rendez-vous:', error);
      return [];
    }
  },

  // Ajouter un nouveau rendez-vous
  add: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment | null> => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        toast.error('Vous devez être connecté pour ajouter un rendez-vous');
        return null;
      }

      const response = await api.post('/appointments', appointment, {
        headers: { 'user-id': currentUser.id.toString() }
      });

      toast.success('Rendez-vous ajouté avec succès');
      return response.data.appointment;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout du rendez-vous');
      return null;
    }
  },

  // Mise à jour d’un rendez-vous existant
  update: async (appointment: Appointment): Promise<boolean> => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        toast.error('Vous devez être connecté pour modifier un rendez-vous');
        return false;
      }

      await api.put(`/appointments/${appointment.id}`, appointment, {
        headers: { 'user-id': currentUser.id.toString() }
      });

      toast.success('Rendez-vous mis à jour avec succès');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour du rendez-vous');
      return false;
    }
  },

  // Supprimer un rendez-vous
  delete: async (id: number): Promise<boolean> => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        toast.error('Vous devez être connecté pour supprimer un rendez-vous');
        return false;
      }

      await api.delete(`/appointments/${id}`, {
        headers: { 'user-id': currentUser.id.toString() }
      });

      toast.success('Rendez-vous supprimé avec succès');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression du rendez-vous');
      return false;
    }
  },

  // Récupérer tous les jours de la semaine actuelle
  getWeekDays: () => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });

    return Array(7)
      .fill(null)
      .map((_, index) => {
        const date = addDays(monday, index);
        return {
          fullDate: date,
          dayName: format(date, 'EEEE', { locale: fr }),
          dayNumber: format(date, 'd', { locale: fr }),
          month: format(date, 'MMMM', { locale: fr }),
          isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        };
      });
  },

  // Récupérer une liste d'heures de 7h à 20h
  getHours: () => {
    return Array(14)
      .fill(null)
      .map((_, index) => {
        const hour = index + 7;
        return `${hour}:00`;
      });
  }
};

// Import nécessaire pour pouvoir utiliser le bouton ailleurs dans le projet
import { Button } from '@/components/ui/button';
