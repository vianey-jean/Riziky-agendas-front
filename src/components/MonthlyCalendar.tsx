import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppointmentService, Appointment } from '@/services/AppointmentService';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Crown, Star, Zap } from 'lucide-react';
import AppointmentModal from './AppointmentModal';
import AppointmentForm from './AppointmentForm';

interface MonthlyCalendarProps {
  onDateClick?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
}

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  onDateClick,
  onAppointmentClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [currentDate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await AppointmentService.getAll();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.date), date)
    );
  };

  const handleDragStart = (appointment: Appointment, e: React.DragEvent) => {
    console.log('Starting drag for appointment:', appointment.titre);
    setDraggedAppointment(appointment);
    e.dataTransfer.setData('text/plain', JSON.stringify(appointment));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (targetDate: Date, e: React.DragEvent) => {
    e.preventDefault();
    console.log('Drop event on date:', format(targetDate, 'yyyy-MM-dd'));
    
    if (draggedAppointment) {
      const originalDate = new Date(draggedAppointment.date);
      
      // Vérifier si la date a changé
      if (!isSameDay(originalDate, targetDate)) {
        console.log('Date changed, opening edit modal with new date');
        
        // Créer l'appointment avec la nouvelle date
        const updatedAppointment = {
          ...draggedAppointment,
          date: format(targetDate, 'yyyy-MM-dd')
        };
        
        setAppointmentToEdit(updatedAppointment);
        setNewDate(targetDate);
        setIsEditModalOpen(true);
      }
    }
    
    setDraggedAppointment(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleEditSuccess = async () => {
    console.log('Edit success, refreshing appointments');
    setIsEditModalOpen(false);
    setAppointmentToEdit(null);
    setNewDate(null);
    await fetchAppointments();
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setAppointmentToEdit(null);
    setNewDate(null);
  };

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  if (loading) {
    return (
      <Card className="calendar-luxury premium-shadow-xl border-0">
        <CardContent className="p-16 text-center">
          <div className="relative mb-8 floating-animation">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
            <Crown className="absolute inset-0 w-6 h-6 m-auto text-primary" />
          </div>
          <p className="text-lg font-bold luxury-text-gradient">Chargement du calendrier mensuel...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="calendar-luxury premium-shadow-xl border-0 overflow-hidden">
        <CardHeader className="premium-gradient text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">
                  {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </CardTitle>
                <p className="text-white/80 text-sm font-medium">Vue mensuelle premium</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-white font-medium">Live</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={previousMonth}
                  className="text-white hover:bg-white/20 w-10 h-10 p-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={nextMonth}
                  className="text-white hover:bg-white/20 w-10 h-10 p-0"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              <Star className="w-5 h-5 text-yellow-300 animate-pulse" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-white via-primary/2 to-purple-500/5">
            <div className="grid grid-cols-7 border-b border-primary/20">
              {weekDays.map(day => (
                <div key={day} className="p-4 text-center font-bold text-primary/80 luxury-card border-r border-primary/10 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayAppointments = getAppointmentsForDate(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isTodayDate = isToday(day);

                return (
                  <div 
                    key={index}
                    className={`min-h-[120px] p-2 border-r border-b border-primary/10 last:border-r-0 transition-all duration-300 cursor-pointer premium-hover ${
                      !isCurrentMonth ? 'bg-gray-50/50 text-muted-foreground' : 'luxury-card hover:bg-primary/5'
                    } ${isTodayDate ? 'premium-gradient text-white glow-effect' : ''}`}
                    onClick={() => onDateClick?.(day)}
                    onDrop={(e) => handleDrop(day, e)}
                    onDragOver={handleDragOver}
                  >
                    <div className={`flex items-center justify-between mb-2 ${isTodayDate ? 'text-white' : ''}`}>
                      <span className={`text-sm font-bold ${isTodayDate ? 'text-white' : isCurrentMonth ? 'text-primary' : 'text-muted-foreground'}`}>
                        {format(day, 'd')}
                      </span>
                      {isTodayDate && <Crown className="w-3 h-3 text-yellow-300" />}
                    </div>

                    <div className="space-y-1">
                      {dayAppointments.slice(0, 3).map(appointment => (
                        <div
                          key={appointment.id}
                          className="text-xs p-1 rounded appointment-luxury text-white cursor-grab hover:opacity-80 transition-opacity glow-effect"
                          draggable
                          onDragStart={(e) => handleDragStart(appointment, e)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick?.(appointment);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <Zap className="w-2 h-2 flex-shrink-0" />
                            <span className="truncate font-medium">{appointment.heure}</span>
                          </div>
                          <div className="truncate text-white/90">{appointment.titre}</div>
                        </div>
                      ))}
                      
                      {dayAppointments.length > 3 && (
                        <Badge variant="secondary" className="text-xs w-full justify-center">
                          +{dayAppointments.length - 3} autres
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {isEditModalOpen && appointmentToEdit && (
        <AppointmentModal 
          isOpen={isEditModalOpen}
          onClose={handleCloseModal}
          title="Modifier le rendez-vous"
          mode="edit"
          onSuccess={handleEditSuccess}
        >
          <AppointmentForm 
            appointment={appointmentToEdit}
            onSuccess={handleEditSuccess}
            onCancel={handleCloseModal}
            disableDate={true}
          />
        </AppointmentModal>
      )}
    </>
  );
};

export default MonthlyCalendar;
