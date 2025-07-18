import React, { useState, useEffect } from 'react';
import { AppointmentService, Appointment } from '@/services/AppointmentService';
import { format } from 'date-fns';
import { Calendar, Clock, Sparkles, Zap, Crown, Star } from 'lucide-react';
import { toast } from 'sonner';

const DashboardCalendar = () => {
  const weekDays = AppointmentService.getWeekDays();
  const hours = AppointmentService.getHours();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const data = await AppointmentService.getCurrentWeekAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Organiser les rendez-vous par jour et par heure
  const appointmentGrid: Record<string, Record<string, Appointment[]>> = {};
  
  weekDays.forEach(day => {
    const dateStr = format(day.fullDate, 'yyyy-MM-dd');
    appointmentGrid[dateStr] = {};
    
    hours.forEach(hour => {
      appointmentGrid[dateStr][hour] = appointments.filter(
        a => a.date === dateStr && a.heure.startsWith(hour.split(':')[0])
      );
    });
  });

  const handleDragStart = (appointment: Appointment, e: React.DragEvent) => {
    console.log('Starting drag for appointment:', appointment.titre);
    setDraggedAppointment(appointment);
    e.dataTransfer.setData('text/plain', JSON.stringify(appointment));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (targetDate: Date, targetHour: string, e: React.DragEvent) => {
    e.preventDefault();
    console.log('Drop event on:', targetDate, targetHour);
    
    if (draggedAppointment) {
      const originalDate = draggedAppointment.date;
      const originalHour = draggedAppointment.heure;
      const newDate = format(targetDate, 'yyyy-MM-dd');
      const newHour = targetHour;
      
      // Vérifier si la date ou l'heure a changé
      if (originalDate !== newDate || !originalHour.startsWith(targetHour.split(':')[0])) {
        console.log('Time/Date changed, updating appointment automatically');
        
        try {
          // Créer l'appointment mis à jour
          const updatedAppointment = {
            ...draggedAppointment,
            date: newDate,
            heure: newHour
          };

          // Sauvegarder directement dans la base de données
          const success = await AppointmentService.update(updatedAppointment);
          
          if (success) {
            toast.success(`Rendez-vous déplacé vers ${format(targetDate, 'dd/MM/yyyy')} à ${newHour}`);
            // Rafraîchir les données
            await fetchAppointments();
          } else {
            toast.error('Erreur lors du déplacement du rendez-vous');
          }
        } catch (error) {
          console.error('Error updating appointment:', error);
          toast.error('Erreur lors du déplacement du rendez-vous');
        }
      }
    }
    
    setDraggedAppointment(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    console.log('Appointment clicked:', appointment);
    setSelectedAppointment(appointment);
  };
  
  if (loading) {
    return (
      <div className="calendar-luxury rounded-3xl premium-shadow-xl border-0 overflow-hidden">
        <div className="p-16 text-center">
          <div className="relative mb-8 floating-animation">
            <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
            <div className="absolute inset-4 w-12 h-12 bg-primary/10 rounded-full blur-sm"></div>
          </div>
          <div className="flex items-center justify-center gap-3 text-xl font-bold luxury-text-gradient mb-3">
            <Crown className="w-6 h-6 text-primary" />
            <span>Chargement du calendrier premium...</span>
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">Synchronisation des données de luxe</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="calendar-luxury rounded-3xl premium-shadow-xl border-0 overflow-hidden">
      {/* En-tête premium */}
      <div className="premium-gradient p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-1">Calendrier Premium</h3>
            <p className="text-white/80 text-base font-medium">Vue détaillée hebdomadaire de luxe</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-white font-medium">En temps réel</span>
            </div>
            <Star className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto premium-scroll">
        <div className="min-w-[900px] relative">
          <div className="grid grid-cols-8 gap-px bg-gradient-to-r from-primary/5 to-purple-500/5">
            {/* Header - Empty cell for hours column */}
            <div className="luxury-card p-4 flex items-center justify-center border-b-2 border-primary/20">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            
            {/* Header - Days of the week */}
            {weekDays.map((day, index) => (
              <div 
                key={index}
                className={`p-4 text-center font-bold border-b-2 transition-all duration-300 ${
                  day.isToday 
                    ? 'premium-gradient text-white border-primary premium-shadow glow-effect' 
                    : 'luxury-card text-primary/80 border-primary/20 hover:border-primary/40 premium-hover'
                }`}
              >
                <div className="font-bold text-lg">{day.dayName}</div>
                <div className={`text-sm mt-1 font-medium ${day.isToday ? 'text-white/90' : 'text-muted-foreground'}`}>
                  {day.dayNumber} {day.month}
                </div>
                {day.isToday && <Crown className="w-4 h-4 mx-auto mt-1 text-yellow-300" />}
              </div>
            ))}
            
            {/* Time slots and appointments avec drag & drop */}
            {hours.map((hour, hourIndex) => (
              <React.Fragment key={`row-${hourIndex}`}>
                {/* Hour cell */}
                <div className="luxury-card p-4 text-center border-r border-primary/10 flex items-center justify-center">
                  <span className="text-base font-bold text-primary">{hour}</span>
                </div>
                
                {/* Day cells for this hour */}
                {weekDays.map((day, dayIndex) => {
                  const dateStr = format(day.fullDate, 'yyyy-MM-dd');
                  const cellAppointments = appointmentGrid[dateStr][hour] || [];
                  
                  return (
                    <div 
                      key={`cell-${hourIndex}-${dayIndex}`}
                      className={`p-3 min-h-[100px] border-r border-primary/10 transition-all duration-300 premium-hover cursor-pointer ${
                        day.isToday ? 'bg-gradient-to-br from-primary/5 to-purple-500/5' : 'luxury-card hover:bg-primary/5'
                      }`}
                      onDrop={(e) => handleDrop(day.fullDate, hour, e)}
                      onDragOver={handleDragOver}
                    >
                      <div className="space-y-2">
                        {cellAppointments.map(appointment => (
                          <div 
                            key={appointment.id}
                            className="appointment-luxury text-white p-3 text-xs rounded-xl cursor-grab hover:cursor-grabbing premium-shadow premium-hover relative overflow-hidden glow-effect active:cursor-grabbing"
                            draggable
                            onDragStart={(e) => handleDragStart(appointment, e)}
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative z-10">
                              <div className="font-bold truncate flex items-center gap-2 mb-1">
                                <Sparkles className="w-3 h-3 flex-shrink-0" />
                                {appointment.titre}
                                <Star className="w-2 h-2 text-yellow-300" />
                              </div>
                              <div className="truncate text-white/90 font-medium">{appointment.location}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCalendar;
