
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import WeekCalendar from '@/components/Weekcalendar';
import AppointmentForm from '@/components/AppointmentForm';
import AppointmentSelector from '@/components/AppointmentSelector';
import AppointmentDetails from '@/components/AppointmentDetails';
import { AuthService } from '@/services/AuthService';
import { AppointmentService, Appointment } from '@/services/AppointmentService';

// Composant Dashboard pour gérer les rendez-vous
const DashboardPage = () => {
  // États pour gérer les différentes vues et actions
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Appointment[]>([]);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const currentUser = AuthService.getCurrentUser();
  
  // Redirection si l'utilisateur n'est pas connecté
  if (!currentUser) {
    return <Navigate to="/connexion" replace />;
  }
  
  // Fonction pour rafraîchir les données
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // Gestion de l'ouverture du formulaire d'ajout
  const handleOpenAdd = () => {
    setActiveAppointment(null);
    setIsAddModalOpen(true);
  };
  
  // Gestion de l'ouverture du formulaire de modification
  const handleOpenEdit = (appointment?: Appointment) => {
    if (appointment) {
      setActiveAppointment(appointment);
      setIsEditModalOpen(false);
      setShowAppointmentDetails(false);
      setIsAddModalOpen(true);
    } else {
      setIsEditModalOpen(true);
    }
  };
  
  // Gestion de l'ouverture du formulaire de suppression
  const handleOpenDelete = () => {
    setIsDeleteModalOpen(true);
  };
  
  // Gestion de l'ouverture du formulaire de recherche
  const handleOpenSearch = () => {
    setIsSearchModalOpen(true);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // Gestion de la recherche de rendez-vous
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      try {
        const results = await AppointmentService.search(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      }
    } else {
      setSearchResults([]);
    }
  };
  
  // Gestion de l'affichage des détails d'un rendez-vous
  const handleViewAppointment = (appointment: Appointment) => {
    setActiveAppointment(appointment);
    setShowAppointmentDetails(true);
    setIsSearchModalOpen(false);
  };
  
  // Gestion de la réussite d'un formulaire
  const handleFormSuccess = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsSearchModalOpen(false);
    setShowAppointmentDetails(false);
    setActiveAppointment(null);
    refreshData();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-gray-600">
          Bienvenue, <span className="font-bold uppercase">{currentUser.prenom} {currentUser.nom}</span>
        </p>
      </div>
      
      <div className="mb-6 flex flex-wrap gap-3">
        <Button 
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600" 
          onClick={handleOpenAdd}
        >
          <PlusCircle className="h-4 w-4" />
          Ajouter un rendez-vous
        </Button>
        
        <Button 
          variant="outline"
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white" 
          onClick={() => handleOpenEdit()}
        >
          <Edit className="h-4 w-4" />
          Modifier un rendez-vous
        </Button>
        
        <Button 
          variant="destructive" 
          className="flex items-center gap-2" 
          onClick={handleOpenDelete}
        >
          <Trash2 className="h-4 w-4" />
          Supprimer un rendez-vous
        </Button>
        
        <Button 
          variant="outline"
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white" 
          onClick={handleOpenSearch}
        >
          <Search className="h-4 w-4" />
          Rechercher un rendez-vous
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <WeekCalendar 
          key={`list-${refreshTrigger}`} 
          userId={currentUser.id} 
          onAppointmentClick={handleViewAppointment} 
        />
      </div>
      
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>{activeAppointment ? "Modifier le rendez-vous" : "Ajouter un rendez-vous"}</DialogTitle>
          <AppointmentForm 
            appointment={activeAppointment || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Sélectionner un rendez-vous à modifier</DialogTitle>
          <AppointmentSelector 
            onSelect={(appointment) => handleOpenEdit(appointment)}
            onCancel={() => setIsEditModalOpen(false)}
            mode="edit"
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Sélectionner un rendez-vous à supprimer</DialogTitle>
          <AppointmentSelector 
            onSelect={handleViewAppointment}
            onCancel={() => setIsDeleteModalOpen(false)}
            mode="delete"
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>Rechercher un rendez-vous</DialogTitle>
          <div className="mt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Entrez au moins 3 caractères..." 
                value={searchQuery} 
                onChange={(e) => handleSearch(e.target.value)} 
              />
            </div>
            
            {searchResults.length > 0 ? (
              <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto">
                {searchResults.map(appointment => (
                  <div 
                    key={appointment.id}
                    className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewAppointment(appointment)}
                  >
                    <div className="font-bold">{appointment.titre}</div>
                    <div className="text-sm text-gray-500">
                      {appointment.date} à {appointment.heure}
                    </div>
                    <div className="text-sm text-gray-600 truncate">{appointment.description}</div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 3 ? (
              <p className="text-gray-500">Aucun résultat trouvé</p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
      
      {activeAppointment && (
        <AppointmentDetails
          appointment={activeAppointment}
          open={showAppointmentDetails}
          onOpenChange={setShowAppointmentDetails}
          onEdit={() => handleOpenEdit(activeAppointment)}
          onDelete={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default DashboardPage;
