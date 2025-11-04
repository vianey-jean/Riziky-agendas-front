
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { AppointmentService, Appointment } from '@/services/AppointmentService';
import { Badge } from '@/components/ui/badge';

/**
 * Props du composant de recherche de rendez-vous
 */
type SearchAppointmentFormProps = {
  onSelect: (appointment: Appointment) => void;
};

/**
 * Composant pour rechercher des rendez-vous
 * Permet de saisir un terme de recherche et affiche les résultats
 */
const SearchAppointmentForm = ({ onSelect }: SearchAppointmentFormProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Appointment[]>([]);

  /**
   * Effectue la recherche lorsque l'utilisateur saisit au moins 3 caractères
   */
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      try {
        const results = await AppointmentService.search(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4 px-2 sm:px-0">
      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Entrez au moins 3 caractères..." 
          value={searchQuery} 
          onChange={(e) => handleSearch(e.target.value)} 
          className="h-10 sm:h-11 text-sm sm:text-base"
        />
      </div>

      {searchResults.length > 0 ? (
        <div className="mt-3 sm:mt-4 space-y-2 max-h-[250px] sm:max-h-[300px] overflow-y-auto">
          {searchResults.map(appointment => (
            <div 
              key={appointment.id}
              className="p-3 sm:p-4 border rounded-lg sm:rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSelect(appointment)}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                <div className="font-bold text-sm sm:text-base">{appointment.titre}</div>
                <Badge variant={appointment.statut === 'validé' ? 'default' : 'destructive'} className="text-xs">
                  {appointment.statut || 'validé'}
                </Badge>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                {appointment.date} à {appointment.heure}
              </div>
              {(appointment.nom || appointment.prenom) && (
                <div className="text-xs sm:text-sm text-gray-600">
                  {appointment.prenom} {appointment.nom}
                </div>
              )}
              <div className="text-xs sm:text-sm text-gray-600 truncate">{appointment.description}</div>
            </div>
          ))}
        </div>
      ) : searchQuery.length >= 3 ? (
        <p className="text-gray-500 text-sm sm:text-base text-center py-4">Aucun résultat trouvé</p>
      ) : null}
    </div>
  );
};

export default SearchAppointmentForm;
