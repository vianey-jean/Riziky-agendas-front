// Importation des composants nécessaires pour la page d'accueil
import { Link } from 'react-router-dom'; // Permet de créer des liens pour la navigation entre les pages
import { Button } from '@/components/ui/button'; // Composant de bouton pour les actions utilisateur
import WeekCalendar from '@/components/Weekcalendar'; // Composant personnalisé pour afficher le calendrier de la semaine
import { AuthService } from '@/services/AuthService'; // Service d'authentification pour gérer l'utilisateur actuel
import { Info, LogIn } from 'lucide-react'; // Icônes utilisées pour l'interface
import { Appointment } from '@/services/AppointmentService'; // Typage des rendez-vous
import { toast } from 'sonner'; // Pour afficher des notifications

// Définition du composant HomePage
const HomePage = () => {
  // Vérifie si l'utilisateur est actuellement authentifié
  const currentUser = AuthService.getCurrentUser();

  // Fonction appelée quand on clique sur un rendez-vous
  

  const handleAppointmentClick = (appointment: Appointment) => {
    toast.success(`Rendez-vous : ${appointment.titre} à ${appointment.heure}  au : ${appointment.location}`, {
      
      duration: 3000, // 3 secondes
      style: {
        background: 'green',     // Fond vert
        color: 'white',           // Texte blanc pour être lisible
      },
      action: {
        label: 'OK',              // Bouton "OK" à droite
        onClick: () => console.log('OK cliqué'), // Ou une autre action si tu veux
      },
    });
  };
  

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Conteneur principal */}
      <div className="max-w-4xl mx-auto">
        {/* Section de bienvenue */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-primary">Bienvenue sur Riziky-Agendas</h1>
          <p className="text-xl text-gray-600 mb-8">
            La solution simple et efficace pour gérer vos rendez-vous
          </p>

          {/* Si l'utilisateur n'est pas connecté */}
          {!currentUser && (
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <Link to="/inscription">
                <Button size="lg">
                  <Info className="mr-1 h-4 w-4" />
                  S'inscrire
                </Button>
              </Link>
              <Link to="/connexion">
                <Button variant="outline" size="lg">
                  <LogIn className="mr-1 h-4 w-4" />
                  Se connecter
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Section Calendrier */}
        <div className="bg-red rounded-lg shadow-md p-6">
          <WeekCalendar onAppointmentClick={handleAppointmentClick} />
        </div>
      </div>
    </div>
  );
};

// Exportation du composant
export default HomePage;
