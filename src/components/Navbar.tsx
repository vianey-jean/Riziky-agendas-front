import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthService } from '@/services/AuthService';
import { AppointmentService, Appointment } from '@/services/AppointmentService';
import AppointmentDetails from '@/components/AppointmentDetails';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Appointment[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [setIsSearching] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const currentUser = AuthService.getCurrentUser();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      setIsSearching(true);
      try {
        const results = await AppointmentService.search(query);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Erreur recherche rendez-vous:', error);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setShowSearchResults(false);
    setSearchQuery('');
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo toujours visible */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center">
                <h1 className="text-xl font-bold text-primary">Riziky-Agendas</h1>
              </Link>
            </div>

            {/* Navigation principale (masquée sur mobile) */}
            <div className="hidden md:flex items-center space-x-12">
              <Link to="/" className="nav-link">Liste RDV</Link>
              <Link to="/a-propos" className="nav-link">À propos</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
              {currentUser && (
                <Link to="/dashboard" className="nav-link font-bold text-blue-500">Prise RDV</Link>
              )}

              <div className="relative">
                <div className="flex items-center border border-gray-300 rounded-md px-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="border-0 focus-visible:ring-0"
                  />
                </div>

                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full mt-1 w-96 bg-white border rounded-md shadow-lg z-50">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleAppointmentClick(result)}
                      >
                        <div className="font-medium">{result.titre}</div>
                        <div className="text-sm text-gray-500">
                          {result.date} à {result.heure}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {currentUser ? (
                <Button onClick={handleLogout} variant="outline">
                  Déconnexion
                </Button>
              ) : (
                <Link to="/connexion">
                  <Button>Connexion</Button>
                </Link>
              )}
            </div>

            {/* Bouton menu mobile */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-primary focus:outline-none"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {currentUser && (
                <Link
                  to="/"
                  className="block px-3 py-2 rounded-md text-base font-bold text-blue-500 hover:text-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Liste RDV
                </Link>
              )}
              <Link
                to="/a-propos"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              {currentUser && (
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-bold text-blue-500 hover:text-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Prise RDV
                </Link>
              )}

              <div className="relative px-3 py-2">
                <div className="flex items-center border border-gray-300 rounded-md px-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>

                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute left-3 right-3 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleAppointmentClick(result)}
                      >
                        <div className="font-medium">{result.titre}</div>
                        <div className="text-sm text-gray-500">
                          {result.date} à {result.heure}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {currentUser ? (
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Déconnexion
                </Button>
              ) : (
                <Link to="/connexion" className="block w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full">Connexion</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Détails du rendez-vous sélectionné */}
      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          open={showAppointmentDetails}
          onOpenChange={setShowAppointmentDetails}
          onEdit={() => {}}
          onDelete={() => {
            setSelectedAppointment(null);
            setShowAppointmentDetails(false);
          }}
        />
      )}
    </>
  );
};

export default Navbar;
