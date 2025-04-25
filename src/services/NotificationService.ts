import { useEffect, useRef, useState } from 'react';
import { Appointment } from './AppointmentService';
import { toast } from 'sonner';
import { parseISO, addHours, isBefore, isAfter } from 'date-fns';

const LOCAL_STORAGE_KEY = 'notifiedAppointmentsConfirmed';

function getConfirmedIds(): Set<string> {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function confirmNotification(id: string) {
  const confirmed = getConfirmedIds();
  confirmed.add(id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(confirmed)));
}

export function useNotificationService(appointments: Appointment[]) {
  const [audioInitialized, setAudioInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // IDs des rendez-vous pour lesquels "Ok" a été cliqué
  const confirmedRef = useRef<Set<string>>(getConfirmedIds());

  // Pour stocker les toasts déjà visibles (évite duplication)
  const shownRef = useRef<Set<string>>(new Set());

  // Initialisation audio
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!audioInitialized && !audioRef.current) {
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audioRef.current.load();
        document.body.setAttribute('data-user-interacted', 'true');
        setAudioInitialized(true);
      }
    };

    window.addEventListener('click', handleUserInteraction, { once: true });
    return () => window.removeEventListener('click', handleUserInteraction);
  }, [audioInitialized]);

  const playSound = () => {
    if (audioRef.current && document.body.hasAttribute('data-user-interacted')) {
      audioRef.current.play().catch(() => {
        console.log('Son désactivé : interaction utilisateur requise');
      });
    }
  };

  useEffect(() => {
    const now = new Date();

    appointments.forEach((appointment) => {
      const appointmentId = appointment.id;

      // Si notification déjà confirmée (Ok cliqué), ne rien faire
      if (confirmedRef.current.has(appointmentId)) return;

      // Si déjà affichée, ne pas la réafficher
      if (shownRef.current.has(appointmentId)) return;

      const appointmentDate = parseISO(`${appointment.date}T${appointment.heure}`);
      const notificationTime = addHours(appointmentDate, -24);

      // Si on est dans la fenêtre de notification (dans les 24h avant le rendez-vous)
      if (isAfter(now, notificationTime) && isBefore(now, appointmentDate)) {
        shownRef.current.add(appointmentId); // Marquer comme affiché
        showNotification(appointment);
      }
    });
  }, [appointments]);

  const showNotification = (appointment: Appointment) => {
    const appointmentId = appointment.id;

    toast.info(
      `Vous avez un rendez-vous demain le ${appointment.date} à ${appointment.heure}`,
      {
        description: `${appointment.titre} au ${appointment.location} pour ${appointment.description}`,
        duration: Infinity,
        action: {
          label: 'Ok',
          onClick: () => {
            playSound();
            confirmNotification(appointmentId);
            confirmedRef.current.add(appointmentId);
            toast.dismiss(); // Ferme la notification une fois confirmée
          }
        },
        onOpen: () => playSound()
      }
    );
  };

  const resetNotifications = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    confirmedRef.current.clear();
    shownRef.current.clear();
  };

  return {
    resetNotifications,
  };
}
