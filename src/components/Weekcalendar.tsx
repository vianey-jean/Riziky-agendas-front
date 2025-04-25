import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isToday, parseISO, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AppointmentService, Appointment } from '../services/AppointmentService';
import { useNotificationService } from '../services/NotificationService'; // ✅ Correction ici
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface WeekCalendarProps {
  onAppointmentClick: (appointment: Appointment) => void;
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ onAppointmentClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const { resetNotifications } = useNotificationService(appointments); // ✅ Hook utilisé ici

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await AppointmentService.getAll();
        setAppointments(data);
      } catch (error) {
        toast.error("Impossible de charger les rendez-vous");
        console.error("Failed to load appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
    resetNotifications();
  }, []);

  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });

  const days = Array.from({ length: 7 }, (_, i) => {
    return addDays(startOfCurrentWeek, i);
  });

  const previousWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
  };

  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((appointment) => {
      const appointmentDate = parseISO(appointment.date);
      return isSameDay(appointmentDate, date);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Calendrier Hebdomadaire</h2>
        <div className="flex space-x-2">
          <button
            onClick={previousWeek}
            className="px-3 py-1 rounded border hover:bg-gray-100 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Précédent
          </button>
          <button
            onClick={nextWeek}
            className="px-3 py-1 rounded border hover:bg-gray-100 flex items-center"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Suivant
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des rendez-vous...</p>
        </div>
      ) : (
        <div className="grid grid-cols-7 border-b">
          {days.map((day, index) => (
            <div
              key={index}
              className={`p-2 text-center border-r last:border-r-0 ${
                isToday(day) ? 'bg-blue-50' : ''
              }`}
            >
              <p className="font-medium">{format(day, 'EEE', { locale: fr })}</p>
              <p
                className={`text-sm ${
                  isToday(day)
                    ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto'
                    : ''
                }`}
              >
                {format(day, 'd', { locale: fr })}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-7 min-h-[300px]">
        {days.map((day, dayIndex) => {
          const dayAppointments = getAppointmentsForDate(day);
          const sortedAppointments = [...dayAppointments].sort((a, b) => {
            const [aHours, aMinutes] = a.heure.split(':').map(Number);
            const [bHours, bMinutes] = b.heure.split(':').map(Number);
            return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
          });

          return (
            <div
              key={dayIndex}
              className={`p-1 border-r last:border-r-0 ${
                isToday(day) ? 'bg-blue-50' : ''
              }`}
            >
              {sortedAppointments.length > 0 ? (
                <div className="space-y-1">
                  {sortedAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={() => onAppointmentClick(appointment)}
                      className="p-2 text-xs bg-rose-100 border-l-4 border-rose-500 rounded hover:bg-rose-200 cursor-pointer"
                    >
                      <p className="font-semibold truncate">{appointment.titre}</p>
                      <p className="text-rose-700">{appointment.heure}</p>
                      <p className="truncate text-gray-600">{appointment.lieu}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs text-gray-400">Aucun rendez-vous</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekCalendar;
