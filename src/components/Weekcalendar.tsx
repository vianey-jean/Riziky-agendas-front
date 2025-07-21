import React, { useState, useEffect } from 'react';
import { startOfWeek, addDays, parseISO, isSameDay, format } from 'date-fns';
import { AppointmentService, Appointment } from '@/services/AppointmentService';
import { useNotificationService } from '@/services/NotificationService';
import { toast } from 'sonner';
import CalendarHeader from './CalendarHeader';
import CalendarDayHeader from './CalendarDayHeader';
import CalendarDay from './CalendarDay';
import RizikyLoadingSpinner from './RizikyLoadingSpinner';
import { Calendar, Sparkles, Crown, Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Props pour le calendrier hebdomadaire
 */
interface WeekCalendarProps {
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentDrop?: (appointment: Appointment, newDate: Date, originalAppointment: Appointment) => void;
  enableDragAndDrop?: boolean;
}

/**
 * Composant de calendrier hebdomadaire
 * Affiche les rendez-vous sur une semaine avec navigation et drag & drop
 */
const WeekCalendar: React.FC<WeekCalendarProps> = ({ 
  onAppointmentClick, 
  onAppointmentDrop,
  enableDragAndDrop = true 
}) => {
  const isMobile = useIsMobile();
  
  // États pour gérer la date courante, les rendez-vous et le chargement
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [originalAppointment, setOriginalAppointment] = useState<Appointment | null>(null);

  // Service de notifications pour les rappels de rendez-vous
  const { resetNotifications } = useNotificationService(appointments);

  // Récupère tous les rendez-vous lors du premier chargement
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await AppointmentService.getAll();
        setAppointments(data);
      } catch (error) {
        toast.error("Impossible de charger les rendez-vous", {
          className: "bg-indigo-700 text-white"
        });
        console.error("Erreur chargement des rendez-vous:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    resetNotifications();
  }, []);

  // Calcul des jours de la semaine courante
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

  // Navigation vers la semaine précédente
  const previousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  // Navigation vers la semaine suivante
  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  // Filtre les rendez-vous pour une date spécifique et les trie par heure
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = parseISO(appointment.date);
      return isSameDay(appointmentDate, date);
    }).sort((a, b) => {
      // Trier par heure
      const [aHours, aMinutes] = a.heure.split(':').map(Number);
      const [bHours, bMinutes] = b.heure.split(':').map(Number);
      return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
    });
  };

  // Gestion du début du drag
  const handleDragStart = (appointment: Appointment, e: React.DragEvent) => {
    if (!enableDragAndDrop) return;
    
    console.log('Week calendar - drag start:', appointment.titre);
    setDraggedAppointment(appointment);
    // Conserver l'état original du rendez-vous
    setOriginalAppointment({ ...appointment });
  };

  // Gestion du drop
  const handleDrop = (appointment: Appointment, newDate: Date) => {
    if (!enableDragAndDrop) return;
    
    console.log('Week calendar - handleDrop called with:', {
      appointmentId: appointment.id,
      appointmentTitle: appointment.titre,
      originalDate: appointment.date,
      newDate: format(newDate, 'yyyy-MM-dd')
    });

    const newDateString = format(newDate, 'yyyy-MM-dd');
    const originalDateString = appointment.date;

    // Vérifier si la date a vraiment changé
    if (newDateString !== originalDateString) {
      console.log('Date has changed, triggering appointment drop callback');
      
      const updatedAppointment = {
        ...appointment,
        date: newDateString
      };

      // NE PAS mettre à jour localement l'état ici
      // L'état sera mis à jour seulement après confirmation

      // Déclencher l'ouverture du formulaire de modification avec la nouvelle date
      if (onAppointmentDrop && originalAppointment) {
        console.log('Calling onAppointmentDrop callback');
        onAppointmentDrop(updatedAppointment, newDate, originalAppointment);
      }

      toast.success(`Rendez-vous préparé pour le ${format(newDate, 'dd/MM/yyyy')}`, {
        className: "bg-indigo-700 text-white"
      });
    } else {
      console.log('Date unchanged, no action needed');
    }

    setDraggedAppointment(null);
  };

  // Fonction pour annuler le déplacement
  const handleCancelDrop = () => {
    if (originalAppointment) {
      // Restaurer le rendez-vous original dans l'état
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === originalAppointment.id ? originalAppointment : apt
        )
      );
    }
    setOriginalAppointment(null);
    setDraggedAppointment(null);
  };

  // Fonction pour confirmer le déplacement
  const handleConfirmDrop = (updatedAppointment: Appointment) => {
    // Mettre à jour l'état local avec le rendez-vous modifié
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === updatedAppointment.id ? updatedAppointment : apt
      )
    );
    setOriginalAppointment(null);
    setDraggedAppointment(null);
  };

  // Affichage d'un indicateur de chargement pendant la récupération des données
  if (loading) {
    return (
      <div className="calendar-luxury rounded-3xl premium-shadow-xl overflow-hidden border-0">
        <div className="p-16 text-center">
          <RizikyLoadingSpinner 
            size="lg"
            text="Préparation de votre calendrier premium"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-luxury rounded-3xl premium-shadow-xl overflow-hidden border-0 premium-hover glow-effect">
      {/* En-tête du calendrier premium avec affichage du mois */}
      <CalendarHeader 
        title="Calendrier Hebdomadaire Premium"
        currentDate={currentDate}
        onPrevious={previousWeek}
        onNext={nextWeek}
      />

      {/* En-têtes des jours de la semaine premium - masqué sur mobile */}
      {!isMobile && (
        <div className="grid grid-cols-7 bg-gradient-to-r from-primary/5 to-purple-500/5 border-b border-primary/20">
          {days.map((day, index) => (
            <CalendarDayHeader key={index} day={day} />
          ))}
        </div>
      )}

      {/* Contenu du calendrier avec les rendez-vous pour chaque jour */}
      <div className={`${
        isMobile 
          ? 'flex flex-col bg-gradient-to-b from-white via-primary/2 to-purple-500/5 max-h-[70vh] overflow-y-auto premium-scroll'
          : 'grid grid-cols-7 min-h-[400px] bg-gradient-to-br from-white via-primary/2 to-purple-500/5'
      }`}>
        {days.map((day, dayIndex) => (
          <CalendarDay 
            key={dayIndex} 
            day={day}
            appointments={getAppointmentsForDate(day)}
            onAppointmentClick={onAppointmentClick}
            onDrop={enableDragAndDrop ? handleDrop : undefined}
            onDragStart={enableDragAndDrop ? handleDragStart : undefined}
            onCancelDrop={enableDragAndDrop ? handleCancelDrop : undefined}
            onConfirmDrop={enableDragAndDrop ? handleConfirmDrop : undefined}
            enableDragAndDrop={enableDragAndDrop}
          />
        ))}
      </div>
    </div>
  );
};

export default WeekCalendar;
