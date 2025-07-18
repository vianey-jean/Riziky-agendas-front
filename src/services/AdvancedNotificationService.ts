
import { toast } from 'sonner';
import { Bell, Clock, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { AppointmentService, Appointment } from './AppointmentService';
import { format, isToday, isTomorrow, addMinutes, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface NotificationSettings {
  reminders: {
    enabled: boolean;
    times: number[]; // minutes before appointment
  };
  email: {
    enabled: boolean;
    confirmations: boolean;
    reminders: boolean;
  };
  desktop: {
    enabled: boolean;
    sound: boolean;
  };
}

export class AdvancedNotificationService {
  private static settings: NotificationSettings = {
    reminders: {
      enabled: true,
      times: [60, 30, 15] // 1h, 30min, 15min avant
    },
    email: {
      enabled: true,
      confirmations: true,
      reminders: true
    },
    desktop: {
      enabled: true,
      sound: true
    }
  };

  private static timers = new Map<string, NodeJS.Timeout>();

  static initializeNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    this.scheduleUpcomingReminders();
  }

  static async scheduleUpcomingReminders() {
    try {
      const appointments = await AppointmentService.getAll();
      this.clearAllTimers();
      
      appointments.forEach(appointment => {
        this.scheduleAppointmentReminders(appointment);
      });
    } catch (error) {
      console.error('Erreur lors de la planification des rappels:', error);
    }
  }

  private static scheduleAppointmentReminders(appointment: Appointment) {
    const appointmentDateTime = new Date(`${appointment.date} ${appointment.heure}`);
    const now = new Date();

    this.settings.reminders.times.forEach(minutesBefore => {
      const reminderTime = addMinutes(appointmentDateTime, -minutesBefore);
      
      if (reminderTime > now) {
        const timerId = `${appointment.id}-${minutesBefore}`;
        const timeoutMs = differenceInMinutes(reminderTime, now) * 60 * 1000;
        
        const timer = setTimeout(() => {
          this.showReminder(appointment, minutesBefore);
        }, timeoutMs);
        
        this.timers.set(timerId, timer);
      }
    });
  }

  private static showReminder(appointment: Appointment, minutesBefore: number) {
    const message = `Rappel: ${appointment.titre} dans ${minutesBefore} minutes`;
    
    // Toast notification
    toast.info(message, {
      description: `${appointment.location} - ${appointment.heure}`,
      duration: 10000,
      action: {
        label: 'Voir détails',
        onClick: () => console.log('Voir rendez-vous:', appointment.id)
      }
    });

    // Desktop notification
    if (this.settings.desktop.enabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(message, {
        body: `${appointment.location} - ${appointment.heure}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }

  static showAppointmentCreated(appointment: Appointment) {
    toast.success('Rendez-vous créé avec succès !', {
      description: `${appointment.titre} - ${format(new Date(appointment.date), 'dd/MM/yyyy', { locale: fr })} à ${appointment.heure}`,
      duration: 5000
    });
  }

  static showAppointmentUpdated(appointment: Appointment) {
    toast.success('Rendez-vous modifié avec succès !', {
      description: `${appointment.titre} - ${format(new Date(appointment.date), 'dd/MM/yyyy', { locale: fr })} à ${appointment.heure}`,
      duration: 5000
    });
  }

  static showAppointmentDeleted(title: string) {
    toast.error('Rendez-vous supprimé', {
      description: `"${title}" a été supprimé définitivement`,
      duration: 5000
    });
  }

  static showConflictWarning(appointment: Appointment, conflictingAppointments: Appointment[]) {
    toast.warning('Conflit de rendez-vous détecté !', {
      description: `${conflictingAppointments.length} autre(s) rendez-vous à la même heure`,
      duration: 8000,
      action: {
        label: 'Voir conflits',
        onClick: () => console.log('Conflits:', conflictingAppointments)
      }
    });
  }

  static showUpcomingToday(appointments: Appointment[]) {
    if (appointments.length > 0) {
      toast.info(`${appointments.length} rendez-vous aujourd'hui`, {
        description: `Prochain: ${appointments[0].titre} à ${appointments[0].heure}`,
        duration: 8000
      });
    }
  }

  static clearAllTimers() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }

  static updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    this.scheduleUpcomingReminders();
  }

  static getSettings(): NotificationSettings {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      this.settings = JSON.parse(saved);
    }
    return this.settings;
  }
}
