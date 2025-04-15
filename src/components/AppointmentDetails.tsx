// Importation des dépendances nécessaires
import { useState } from 'react'; // Pour gérer l'état local dans le composant
import { format, parseISO } from 'date-fns'; // Pour formater et analyser des dates
import { fr } from 'date-fns/locale'; // Pour définir la locale française pour la gestion des dates
import { Edit, Trash2, Clock, MapPin, CalendarIcon } from 'lucide-react'; // Importation des icônes de la bibliothèque lucide-react
import { Button } from '@/components/ui/button'; // Composant bouton personnalisé
import { AppointmentService, Appointment } from '@/services/AppointmentService'; // Service pour gérer les rendez-vous
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'; // Composants pour afficher un dialog modal
import { toast } from 'sonner'; // Bibliothèque pour afficher des notifications toast

// Définition du type des props que ce composant attend
type AppointmentDetailsProps = {
  appointment: Appointment; // Détails du rendez-vous
  open: boolean; // Si le modal est ouvert ou non
  onOpenChange: (open: boolean) => void; // Fonction pour changer l'état de visibilité du modal
  onEdit: () => void; // Fonction pour modifier un rendez-vous
  onDelete: () => void; // Fonction pour supprimer un rendez-vous
};

// Composant pour afficher les détails d'un rendez-vous
const AppointmentDetails = ({
  appointment,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: AppointmentDetailsProps) => {
  // États locaux pour gérer la confirmation de suppression et l'état de suppression
  const [confirmDelete, setConfirmDelete] = useState(false); // Si la suppression est confirmée
  const [isDeleting, setIsDeleting] = useState(false); // Si le rendez-vous est en cours de suppression

  // Fonction pour gérer la suppression d'un rendez-vous
  const handleDelete = async () => {
    if (confirmDelete) { // Si l'utilisateur a confirmé la suppression
      setIsDeleting(true); // Désactiver les actions pendant la suppression
      try {
        const success = await AppointmentService.delete(appointment.id); // Appel au service pour supprimer le rendez-vous
        if (success) { // Si la suppression réussit
          toast.success("Rendez-vous supprimé avec succès"); // Afficher une notification de succès
          onDelete(); // Appeler la fonction onDelete pour mettre à jour l'état dans le parent
          onOpenChange(false); // Fermer le modal
        } else {
          toast.error("Erreur lors de la suppression du rendez-vous"); // Afficher une erreur si la suppression échoue
          setConfirmDelete(false); // Réinitialiser la confirmation
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error); // Log de l'erreur dans la console
        toast.error("Une erreur est survenue"); // Afficher une notification d'erreur
      } finally {
        setIsDeleting(false); // Réactiver les actions après la tentative de suppression
      }
    } else {
      setConfirmDelete(true); // Si la suppression n'est pas encore confirmée, demander la confirmation
    }
  };

  // Formatage de la date du rendez-vous en utilisant la locale française
  const formattedDate = format(
    parseISO(appointment.date), // Conversion de la date au format ISO
    'EEEE d MMMM yyyy', // Format de la date, par exemple "lundi 15 mars 2025"
    { locale: fr } // Application de la locale française
  );

  return (
    <Dialog open={open} onOpenChange={(open) => { // Affichage du dialog modal
      if (!open) setConfirmDelete(false); // Réinitialiser la confirmation de suppression quand le modal est fermé
      onOpenChange(open); // Appeler la fonction pour changer l'état du modal
    }}>
      <DialogContent className="max-w-md"> {/* Contenu du modal */}
        <DialogHeader> {/* Entête du modal */}
          <DialogTitle className="text-xl">{appointment.titre}</DialogTitle> {/* Titre du rendez-vous */}
          <DialogDescription> {/* Description sous le titre */}
            Détails du rendez-vous
          </DialogDescription>
        </DialogHeader>

        {/* Contenu détaillé des informations du rendez-vous */}
        <div className="py-4 space-y-4">
          <div className="flex items-start space-x-3">
            <CalendarIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Date</p>
              <p className="text-gray-600">{formattedDate}</p> {/* Affichage de la date formatée */}
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Heure et durée</p>
              <p className="text-gray-600">
                {appointment.heure} ({appointment.duree} minutes) {/* Affichage de l'heure et de la durée */}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Lieu</p>
              <p className="text-gray-600">{appointment.location}</p> {/* Affichage du lieu du rendez-vous */}
            </div>
          </div>

          <div className="pt-2">
            <p className="font-medium">Description</p>
            <p className="text-gray-600 mt-1">{appointment.description}</p> {/* Affichage de la description */}
          </div>
        </div>

        {/* Footer du modal avec les actions (Modifier, Supprimer, Confirmer la suppression) */}
        <DialogFooter className="flex sm:justify-between">
          {confirmDelete ? ( // Si la suppression est en cours de confirmation
            <>
              <div className="text-red-500 text-sm font-medium mb-2 sm:mb-0">
                Êtes-vous sûr de vouloir supprimer ce rendez-vous ? {/* Message de confirmation de suppression */}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setConfirmDelete(false)} // Annuler la suppression
                  disabled={isDeleting} // Désactiver le bouton pendant la suppression
                >
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDelete} // Confirmer la suppression
                  disabled={isDeleting} // Désactiver le bouton pendant la suppression
                >
                  {isDeleting ? "Suppression..." : "Confirmer"} {/* Afficher un message en fonction de l'état de suppression */}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" className="sm:mr-auto" onClick={onEdit}> {/* Bouton pour modifier le rendez-vous */}
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button variant="destructive" onClick={() => setConfirmDelete(true)}> {/* Bouton pour supprimer */}
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Exportation du composant
export default AppointmentDetails;
