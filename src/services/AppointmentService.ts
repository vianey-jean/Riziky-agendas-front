import api from './api';
import { format, parseISO, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { AuthService } from './AuthService';
import { ReactNode } from 'react';

export interface Appointment {
  lieu: ReactNode;
  id: number;
  userId: number;
  statut?: string;
  nom?: string;
  prenom?: string;
  dateNaissance?: string;
  telephone?: string;
  titre: string;
  description: string;
  date: string;
  heure: string;
  duree: number;
  location: string;
}

export const AppointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) return [];

      const response = await api.get('/appointments', {
        headers: { 'user-id': currentUser.id.toString() }
      });

      // Filtrer seulement les rendez-vous validés pour l'affichage du calendrier
      const appointments = response.data.appointments || [];
      return appointments.filter((appointment: Appointment) => appointment.statut === 'validé');
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      return [];
    }
  },

  getAllWithStatus: async (): Promise<Appointment[]> => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) return [];

      const response = await api.get('/appointments', {
        headers: { 'user-id': currentUser.id.toString() }
      });

      // Retourner tous les rendez-vous (validés et annulés) pour la recherche
      return response.data.appointments || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      return [];
    }
  },

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

  search: async (query: string): Promise<Appointment[]> => {
    if (query.length < 3) return [];

    try {
      // Utiliser getAllWithStatus pour obtenir tous les rendez-vous
      const allAppointments = await AppointmentService.getAllWithStatus();
      
      // Filtrer localement pour inclure tous les champs
      const filteredAppointments = allAppointments.filter(appointment => {
        const searchableFields = [
          appointment.titre?.toLowerCase() || '',
          appointment.description?.toLowerCase() || '',
          appointment.location?.toLowerCase() || '',
          appointment.nom?.toLowerCase() || '',
          appointment.prenom?.toLowerCase() || '',
          appointment.telephone || '',
          appointment.dateNaissance || '',
          appointment.date || '',
          appointment.heure || ''
        ];
        
        const searchTerm = query.toLowerCase();
        
        return searchableFields.some(field => 
          field.includes(searchTerm)
        );
      });

      return filteredAppointments;
    } catch (error) {
      console.error('Erreur lors de la recherche de rendez-vous:', error);
      return [];
    }
  },

  add: async (appointment: Omit<Appointment, 'id'>): Promise<Appointment | null> => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        toast.error('Vous devez être connecté pour ajouter un rendez-vous');
        return null;
      }

      console.log('Envoi des données au serveur:', appointment);

      const response = await api.post('/appointments', appointment, {
        headers: { 'user-id': currentUser.id.toString() }
      });

      toast.success('Rendez-vous ajouté avec succès');
      return response.data.appointment;
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout du rendez-vous');
      return null;
    }
  },

  update: async (appointment: Appointment): Promise<boolean> => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        toast.error('Vous devez être connecté pour modifier un rendez-vous');
        return false;
      }

      console.log('Mise à jour des données au serveur:', appointment);

      await api.put(`/appointments/${appointment.id}`, appointment, {
        headers: { 'user-id': currentUser.id.toString() }
      });

      toast.success('Rendez-vous mis à jour avec succès');
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour du rendez-vous');
      return false;
    }
  },

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

      // Filtrer seulement les rendez-vous validés pour l'affichage du calendrier
      const appointments = response.data.appointments || [];
      return appointments.filter((appointment: Appointment) => appointment.statut === 'validé');
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous de la semaine:', error);
      return [];
    }
  },

  getWeekDays: () => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });

    return Array(7)
      .fill(null)
      .map((_, index) => {
        const date = addDays(monday, index);
        return {
          fullDate: date,
          dayName: format(date, 'EEEE'),
          dayNumber: format(date, 'd'),
          month: format(date, 'MMMM'),
          isToday: format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
        };
      });
  },

  getHours: () => {
    return Array(14)
      .fill(null)
      .map((_, index) => {
        const hour = index + 7;
        return `${hour}:00`;
      });
  }
};
