// Importation des composants nécessaires pour la page d'accueil
import { Link } from 'react-router-dom'; // Permet de créer des liens pour la navigation entre les pages
import { Button } from '@/components/ui/button'; // Composant de bouton pour les actions utilisateur
import WeekCalendar from '@/components/Weekcalendar'; // Composant personnalisé pour afficher le calendrier de la semaine
import { AuthService } from '@/services/AuthService'; // Service d'authentification pour gérer l'utilisateur actuel
import { Info, LogIn } from 'lucide-react';
// Définition du composant HomePage
const HomePage = () => {
  // Vérifie si l'utilisateur est actuellement authentifié
  const currentUser = AuthService.getCurrentUser();
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Conteneur principal avec une largeur maximale et du padding */}
      <div className="max-w-4xl mx-auto">
        
        {/* Section de bienvenue avec un titre et une description */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-primary">Bienvenue sur Riziky-Agendas</h1>
          <p className="text-xl text-gray-600 mb-8">
            La solution simple et efficace pour gérer vos rendez-vous
          </p>
          
          {/* Si l'utilisateur n'est pas connecté, afficher les boutons d'inscription et de connexion */}
          {!currentUser && (
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <Link to="/inscription">
                {/* Lien vers la page d'inscription */}
                <Button size="lg">
                <Info className="mr-1 h-4 w-4" />
                  S'inscrire</Button>
              </Link>
              <Link to="/connexion">
                {/* Lien vers la page de connexion */}
                <Button variant="outline" size="lg">
                <LogIn className="mr-1 h-4 w-4" />
                  Se connecter
                  </Button>
                  
                 
              </Link>
            </div>
          )}
        </div>
        
        {/* Section contenant le calendrier de la semaine */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <WeekCalendar /> {/* Affichage du calendrier personnalisé */}
        </div>
      </div>
    </div>
  );
};

// Exportation du composant pour pouvoir l'utiliser ailleurs dans l'application
export default HomePage;
