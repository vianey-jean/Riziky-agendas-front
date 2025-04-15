// Importation des hooks et bibliothèques nécessaires
import { useState, useEffect } from 'react';  // Importation des hooks React
import { useForm } from 'react-hook-form';  // Importation de react-hook-form pour la gestion des formulaires
import { zodResolver } from '@hookform/resolvers/zod';  // Résolveur pour Zod (validation de schéma)
import * as z from 'zod';  // Zod pour la validation des données
import { format } from 'date-fns';  // Utilitaire pour le formatage de dates
import { fr } from 'date-fns/locale';  // Locale française pour le formatage des dates
import { Calendar as CalendarIcon, Clock } from 'lucide-react';  // Icônes utilisées dans le formulaire
import { Button } from '@/components/ui/button';  // Composant bouton
import { Calendar } from '@/components/ui/calendar';  // Composant calendrier
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';  // Composants de formulaire de l'UI
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';  // Composants popover pour la sélection de date
import { Input } from '@/components/ui/input';  // Champ de saisie
import { Textarea } from '@/components/ui/textarea';  // Champ de texte pour les descriptions
import { AppointmentService, Appointment } from '@/services/AppointmentService';  // Service pour gérer les rendez-vous
import { AuthService } from '@/services/AuthService';  // Service d'authentification
import { toast } from 'sonner';  // Notifications toast

// Schéma de validation Zod pour le formulaire
const formSchema = z.object({
  titre: z.string().min(2, {
    message: "Le titre doit contenir au moins 2 caractères.",
  }),
  description: z.string().min(5, {
    message: "La description doit contenir au moins 5 caractères.",
  }),
  date: z.date({
    required_error: "Veuillez sélectionner une date.",
  }),
  heure: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Format d'heure invalide (HH:MM).",
  }),
  duree: z.number().min(15, {
    message: "La durée minimale est de 15 minutes.",
  }).max(180, {
    message: "La durée maximale est de 180 minutes.",
  }),
  location: z.string().min(3, {
    message: "Le lieu doit contenir au moins 3 caractères.",
  }),
});

// Type des propriétés du formulaire de rendez-vous
type AppointmentFormProps = {
  appointment?: Appointment;  // Optionnel, utilisé en mode édition
  onSuccess: () => void;  // Callback à appeler après un succès
  onCancel: () => void;  // Callback à appeler en cas d'annulation
};

// Composant principal pour ajouter ou modifier un rendez-vous
const AppointmentForm = ({ appointment, onSuccess, onCancel }: AppointmentFormProps) => {
  // State pour gérer l'état de disponibilité de l'heure et le statut de soumission
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableHours, setAvailableHours] = useState<string[]>([]);  // Liste des heures disponibles
  const isEditing = !!appointment;  // Vérifie si c'est un mode édition
  
  const currentUser = AuthService.getCurrentUser();  // Récupère l'utilisateur connecté
  
  // Initialisation du formulaire avec des valeurs par défaut ou celles de l'appointment existant
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),  // Utilisation de Zod pour la validation
    defaultValues: appointment ? {
      titre: appointment.titre,
      description: appointment.description,
      date: new Date(appointment.date),
      heure: appointment.heure,
      duree: appointment.duree,
      location: appointment.location,
    } : {
      titre: "",
      description: "",
      date: new Date(),
      heure: "09:00",
      duree: 60,
      location: "",
    },
  });

  // Fonction pour vérifier la disponibilité des horaires pour la date sélectionnée
  const checkAvailability = async (date: Date, currentHeure?: string) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');  // Formate la date sélectionnée
      const appointments = await AppointmentService.getCurrentWeekAppointments();  // Récupère les rendez-vous de la semaine
      const dayAppointments = appointments.filter(a => a.date === dateStr);  // Filtre ceux de la même date
      
      // Génère les horaires possibles (de 7h à 20h par tranche de 30 minutes)
      const allHours = [];
      for (let hour = 7; hour <= 20; hour++) {
        for (let min = 0; min < 60; min += 30) {
          allHours.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
        }
      }
      
      // Filtre les horaires déjà pris
      const unavailableHours = new Set();
      dayAppointments.forEach(app => {
        if (appointment && app.id === appointment.id) return;  // Ne pas bloquer l'horaire en mode édition
        
        const appHour = parseInt(app.heure.split(':')[0]);
        const appMin = parseInt(app.heure.split(':')[1]);
        const endHour = appHour + Math.floor((appMin + app.duree) / 60);
        const endMin = (appMin + app.duree) % 60;
        
        // Bloque toutes les heures qui chevauchent le rendez-vous
        allHours.forEach(time => {
          const [h, m] = time.split(':').map(Number);
          const timeInMinutes = h * 60 + m;
          const appStartInMinutes = appHour * 60 + appMin;
          const appEndInMinutes = endHour * 60 + endMin;
          
          if (timeInMinutes >= appStartInMinutes && timeInMinutes < appEndInMinutes) {
            unavailableHours.add(time);
          }
        });
      });
      
      // Sélectionne les horaires disponibles
      const available = allHours.filter(hour => !unavailableHours.has(hour));
      setAvailableHours(available);
      
      // En mode édition, ajoute l'heure actuelle si elle est indisponible
      if (currentHeure && !available.includes(currentHeure)) {
        setAvailableHours(prev => [...prev, currentHeure].sort());
      }
      
      return available.length > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      return false;
    }
  };

  // Vérifie la disponibilité à chaque fois que la date ou l'heure change
  useEffect(() => {
    const date = form.watch('date');
    const heure = form.watch('heure');
    
    if (date) {
      checkAvailability(date, isEditing ? heure : undefined)
        .then(available => setIsAvailable(available));  // Met à jour l'état de la disponibilité
    }
  }, [form.watch('date'), isEditing]);

  // Fonction de soumission du formulaire
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentUser) {
      toast.error("Vous devez être connecté pour ajouter un rendez-vous");
      return;
    }
    
    setIsSubmitting(true);  // Déclenche la soumission
    try {
      // Formate les données pour l'API
      const appointmentData = {
        ...values,
        userId: currentUser.id,
        date: format(values.date, 'yyyy-MM-dd'),
      };
      
      let success = false;
      
      // Mode édition (mise à jour d'un rendez-vous existant)
      if (isEditing && appointment) {
        success = await AppointmentService.update({
          ...appointmentData,
          id: appointment.id,
        } as Appointment);
        
        if (success) {
          toast.success("Rendez-vous modifié avec succès");
        }
      } else {
        // Mode création (ajout d'un nouveau rendez-vous)
        const newAppointment = await AppointmentService.add(appointmentData as Omit<Appointment, 'id'>);
        success = !!newAppointment;
        
        if (success) {
          toast.success("Rendez-vous ajouté avec succès");
        }
      }
      
      if (success) {
        onSuccess();  // Callback après réussite
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du rendez-vous:', error);
      toast.error("Une erreur est survenue lors de l'enregistrement du rendez-vous");
    } finally {
      setIsSubmitting(false);  // Fin de la soumission
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Champ Titre */}
        <FormField
          control={form.control}
          name="titre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Rendez-vous médecin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Grille pour Date et Heure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Champ Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                        disabled={isSubmitting}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'dd MMM yyyy', { locale: fr }) : 'Choisir une date'}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      selected={field.value}
                      onChange={field.onChange}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Champ Heure */}
          <FormField
            control={form.control}
            name="heure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure</FormLabel>
                <FormControl>
                  <select {...field} disabled={isSubmitting}>
                    {availableHours.map(hour => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Champ Durée */}
        <FormField
          control={form.control}
          name="duree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durée (minutes)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="60" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Champ Lieu */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lieu</FormLabel>
              <FormControl>
                <Input placeholder="Adresse" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description du rendez-vous" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Boutons */}
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isAvailable}
          >
            {isEditing ? 'Modifier' : 'Ajouter'} le rendez-vous
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AppointmentForm;
