
import { useState, useEffect } from 'react';
import { format} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { AppointmentService, Appointment } from '@/services/AppointmentService';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {Reply } from 'lucide-react';

type AppointmentSelectorProps = {
  onSelect: (appointment: Appointment) => void;
  onCancel: () => void;
  buttonText?: string;
  mode?: 'edit' | 'delete';
};

const AppointmentSelector = ({ 
  onSelect, 
  onCancel, 
  buttonText = "Sélectionner",
  mode = 'edit'
}: AppointmentSelectorProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  
  const fetchAppointments = async (date?: Date) => {
    setLoading(true);
    try {
      let appointmentsData: Appointment[] = [];
      if (date) {
        const dateStr = format(date, 'yyyy-MM-dd');
        const allAppointments = await AppointmentService.getAll();
        appointmentsData = allAppointments.filter(a => a.date === dateStr);
      } else {
        appointmentsData = await AppointmentService.getAll();
      }
      setAppointments(appointmentsData);
      setFilteredAppointments(appointmentsData);
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Récupérer les rendez-vous lors du changement de date
  useEffect(() => {
    if (selectedDate) {
      fetchAppointments(selectedDate);
    }
  }, [selectedDate]);
  
  // Filtrer les rendez-vous en fonction de la recherche
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAppointments(appointments);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = appointments.filter(
      app => 
        app.titre.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.location.toLowerCase().includes(query)
    );
    
    setFilteredAppointments(filtered);
  }, [searchQuery, appointments]);
  
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-full justify-start text-left font-normal h-10 sm:h-11 text-sm sm:text-base"
              >
                {selectedDate ? (
                  format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
                ) : (
                  <span>Sélectionner une date</span>
                )}
                <CalendarIcon className="ml-auto h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="relative flex-1">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
          <Input 
            placeholder="Rechercher..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-9 h-10 sm:h-11 text-sm sm:text-base"
          />
        </div>
      </div>
      
      <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
        {loading ? (
          <p className="text-center py-4 text-gray-500 text-sm sm:text-base">Chargement...</p>
        ) : filteredAppointments.length === 0 ? (
          <p className="text-center py-4 text-gray-500 text-sm sm:text-base">
            Aucun rendez-vous trouvé pour cette date
          </p>
        ) : (
          filteredAppointments.map(appointment => (
            <Card 
              key={appointment.id} 
              className={`cursor-pointer border-l-4 ${mode === 'edit' ? 'border-l-primary' : 'border-l-destructive'} hover:bg-accent transition-colors duration-200`}
              onClick={() => onSelect(appointment)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm sm:text-base">{appointment.titre}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{appointment.description}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      {appointment.heure}
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs sm:text-sm text-gray-500">{appointment.location}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={onCancel} className="h-9 sm:h-10 text-sm sm:text-base">
        <Reply className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Annuler
        </Button>
      </div>
    </div>
  );
};

export default AppointmentSelector;
