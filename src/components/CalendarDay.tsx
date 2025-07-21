import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '@/services/AppointmentService';
import CalendarAppointment from './CalendarAppointment';
import MobileAppointmentGrid from './MobileAppointmentGrid';
import { Calendar, Plus, Crown, Star, Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Props pour un jour du calendrier
 */
type CalendarDayProps = {
  day: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onDrop?: (appointment: Appointment, newDate: Date) => void;
  onDragStart?: (appointment: Appointment, e: React.DragEvent) => void;
  onCancelDrop?: () => void;
  onConfirmDrop?: (appointment: Appointment) => void;
  enableDragAndDrop?: boolean;
};

/**
 * Composant pour afficher un jour dans le calendrier hebdomadaire moderne
 * avec tous les rendez-vous associés à ce jour et support du drag & drop
 */
const CalendarDay = ({ 
  day, 
  appointments, 
  onAppointmentClick, 
  onDrop, 
  onDragStart, 
  onCancelDrop, 
  onConfirmDrop,
  enableDragAndDrop = true 
}: CalendarDayProps) => {
  const isMobile = useIsMobile();
  
  // Trier les rendez-vous par heure
  const sortedAppointments = [...appointments].sort((a, b) => {
    const [aHours, aMinutes] = a.heure.split(':').map(Number);
    const [bHours, bMinutes] = b.heure.split(':').map(Number);
    return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
  });

  const isCurrentDay = isToday(day);

  const handleDragOver = (e: React.DragEvent) => {
    if (!enableDragAndDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!enableDragAndDrop) return;
    e.preventDefault();
    console.log('Drop event triggered on day:', format(day, 'yyyy-MM-dd'));
    
    try {
      const appointmentData = e.dataTransfer.getData('text/plain');
      console.log('Dropped data:', appointmentData);
      
      if (appointmentData) {
        const appointment = JSON.parse(appointmentData) as Appointment;
        console.log('Parsed appointment:', appointment);
        
        if (onDrop) {
          onDrop(appointment, day);
        }
      }
    } catch (error) {
      console.error('Erreur lors du drop:', error);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (!enableDragAndDrop) return;
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!enableDragAndDrop) return;
    e.preventDefault();
  };

  // Affichage mobile : disposition horizontale avec date à gauche
  if (isMobile) {
    return (
      <div 
        onDragOver={enableDragAndDrop ? handleDragOver : undefined}
        onDragEnter={enableDragAndDrop ? handleDragEnter : undefined}
        onDragLeave={enableDragAndDrop ? handleDragLeave : undefined}
        onDrop={enableDragAndDrop ? handleDrop : undefined}
        className={`flex flex-col border-b border-primary/20 transition-all duration-300 relative group premium-hover ${
          isCurrentDay 
            ? 'bg-gradient-to-r from-primary/10 to-purple-500/10' 
            : 'luxury-card hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-500/5'
        }`}
      >
        {/* Date section - en haut */}
        <div className={`flex-shrink-0 p-4 flex items-center justify-center border-b border-primary/20 ${
          isCurrentDay ? 'bg-gradient-to-r from-primary/20 to-purple-500/20' : 'bg-gradient-to-r from-primary/5 to-purple-500/5'
        }`}>
          {/* Premium indicator pour le jour actuel */}
          {isCurrentDay && (
            <div className="flex items-center gap-2 mr-4">
              <div className="w-3 h-3 premium-gradient rounded-full premium-shadow relative">
                <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
              </div>
              <Crown className="w-4 h-4 text-primary" />
            </div>
          )}
          
          <div className="text-center">
            <div className={`text-sm font-medium mb-1 ${
              isCurrentDay ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {format(day, 'EEEE', { locale: fr })}
            </div>
            <div className={`text-2xl font-bold ${
              isCurrentDay ? 'luxury-text-gradient' : 'text-primary'
            }`}>
              {format(day, 'd')}
            </div>
            <div className={`text-sm font-medium ${
              isCurrentDay ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {format(day, 'MMM yyyy', { locale: fr })}
            </div>
          </div>
        </div>

        {/* Appointments section - en bas avec grille */}
        <div className="flex-1 min-h-[200px]">
          {sortedAppointments.length > 0 ? (
            <MobileAppointmentGrid
              appointments={sortedAppointments}
              onAppointmentClick={onAppointmentClick}
              onDragStart={enableDragAndDrop ? onDragStart : undefined}
              enableDragAndDrop={enableDragAndDrop}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                isCurrentDay 
                  ? 'premium-gradient' 
                  : 'luxury-card border border-primary/20 group-hover:border-primary/40'
              }`}>
                <Calendar className={`w-6 h-6 ${
                  isCurrentDay ? 'text-white' : 'text-primary group-hover:text-primary/80'
                }`} />
              </div>
              <p className={`text-sm font-bold mb-1 ${
                isCurrentDay ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
              }`}>
                Aucun RDV
              </p>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Journée libre
              </p>
            </div>
          )}
        </div>

        {/* Premium hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-purple-500/0 group-hover:from-primary/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none"></div>
      </div>
    );
  }

  // Affichage desktop : disposition originale
  return (
    <div 
      onDragOver={enableDragAndDrop ? handleDragOver : undefined}
      onDragEnter={enableDragAndDrop ? handleDragEnter : undefined}
      onDragLeave={enableDragAndDrop ? handleDragLeave : undefined}
      onDrop={enableDragAndDrop ? handleDrop : undefined}
      className={`p-4 border-r last:border-r-0 min-h-[400px] transition-all duration-300 relative group premium-hover ${
        isCurrentDay 
          ? 'bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/30' 
          : 'luxury-card hover:bg-gradient-to-br hover:from-primary/5 hover:to-purple-500/5'
      }`}
    >
      {/* Premium indicator pour le jour actuel */}
      {isCurrentDay && (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <div className="w-4 h-4 premium-gradient rounded-full premium-shadow relative">
            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
          </div>
          <Crown className="w-4 h-4 text-primary" />
        </div>
      )}

      {sortedAppointments.length > 0 ? (
        <div className="space-y-3">
          {sortedAppointments.map((appointment) => (
            <CalendarAppointment 
              key={appointment.id} 
              appointment={appointment} 
              onClick={onAppointmentClick}
              onDragStart={enableDragAndDrop ? onDragStart : undefined}
              enableDragAndDrop={enableDragAndDrop}
            />
          ))}
          
          {/* Premium indicator pour plus de rendez-vous */}
          {sortedAppointments.length > 3 && (
            <div className="text-center py-3">
              <div className="inline-flex items-center gap-2 text-sm text-primary bg-gradient-to-r from-primary/10 to-purple-500/10 px-4 py-2 rounded-full border border-primary/20 premium-shadow">
                <Star className="w-3 h-3" />
                <span className="font-bold">{sortedAppointments.length - 3} autres</span>
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center py-12">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
            isCurrentDay 
              ? 'premium-gradient' 
              : 'luxury-card border-2 border-primary/20 group-hover:border-primary/40'
          }`}>
            <Calendar className={`w-7 h-7 ${
              isCurrentDay ? 'text-white' : 'text-primary group-hover:text-primary/80'
            }`} />
          </div>
          <p className={`text-sm font-bold mb-1 ${
            isCurrentDay ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
          }`}>
            Aucun rendez-vous
          </p>
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Journée libre
          </p>
        </div>
      )}

      {/* Premium hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-purple-500/0 group-hover:from-primary/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none rounded-lg"></div>
    </div>
  );
};

export default CalendarDay;
