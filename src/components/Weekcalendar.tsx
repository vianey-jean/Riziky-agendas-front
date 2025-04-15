
import { useState, useEffect } from 'react';
import { AppointmentService, Appointment } from '@/services/AppointmentService';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Props du composant WeekCalendar
interface WeekCalendarProps {
  userId?: number;
  onAppointmentClick?: (appointment: Appointment) => void;
}

// Composant qui affiche les rendez-vous de la semaine
const WeekCalendar = ({ userId, onAppointmentClick }: WeekCalendarProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Récupération des rendez-vous de la semaine
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await AppointmentService.getCurrentWeekAppointments(userId);
        // Tri des rendez-vous par date puis par heure
        const sortedData = data.sort((a, b) => {
          // Comparaison des dates
          const dateComparison = a.date.localeCompare(b.date);
          // Si les dates sont identiques, comparer les heures
          if (dateComparison === 0) {
            return a.heure.localeCompare(b.heure);
          }
          return dateComparison;
        });
        setAppointments(sortedData || []);
      } catch (error) {
        console.error('Erreur récupération rendez-vous:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [userId]);
  
  // Gestion du clic sur un rendez-vous
  const handleAppointmentClick = (appointment: Appointment) => {
    if (onAppointmentClick) {
      onAppointmentClick(appointment);
    }
  };
  
  // Affichage pendant le chargement
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  
  // Message si aucun rendez-vous
  if (appointments.length === 0) {
    return <p className="text-gray-500 py-2">Aucun rendez-vous</p>;
  }
  
  // Affichage des rendez-vous
  return (
    <div className="space-y-4">
      {appointments.map(appointment => (
        <Card 
          key={appointment.id} 
          className="border-l-4 border-l-primary hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => handleAppointmentClick(appointment)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between">
              <h4 className="font-bold uppercase">{appointment.titre}</h4>
              <span className="font-bold text-red-500 uppercase">{appointment.heure}</span>
            </div>
            <p className="font-bold text-blue-500 uppercase mt-1">{appointment.date}</p>
            <p className="text-sm text-gray-600 mt-1">{appointment.description}</p>
            <p className="text-sm text-gray-500 mt-1">{appointment.location}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WeekCalendar;
