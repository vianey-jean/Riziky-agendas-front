
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ClientService, Client } from '@/services/ClientService';
import { User, Check } from 'lucide-react';

interface ClientAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onClientSelect: (client: Client) => void;
  placeholder?: string;
  className?: string;
}

const ClientAutocomplete: React.FC<ClientAutocompleteProps> = ({
  value,
  onChange,
  onClientSelect,
  placeholder = " Nom de famille",
  className = "pl-3"
}) => {
  const [suggestions, setSuggestions] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Charger tous les clients au montage du composant
  useEffect(() => {
    let isMounted = true;
    
    const loadClients = async () => {
      try {
        setIsLoading(true);
        const allClients = await ClientService.getAllClients();
        if (isMounted) {
          setClients(allClients);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadClients();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Fonction de filtrage memorisée
  const filterClients = useMemo(() => {
    return (searchValue: string, clientList: Client[]) => {
      if (searchValue.length < 3) return [];
      
      const filtered = clientList.filter(client =>
        client.nom?.toLowerCase().includes(searchValue.toLowerCase()) ||
        client.prenom?.toLowerCase().includes(searchValue.toLowerCase())
      );
      return filtered.slice(0, 5); // Limiter à 5 suggestions
    };
  }, []);

  // Filtrer les suggestions avec debouncing
  useEffect(() => {
    // Nettoyer le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Créer un nouveau timer pour le debouncing
    debounceTimerRef.current = setTimeout(() => {
      const filtered = filterClients(value, clients);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && value.length >= 3);
    }, 150); // 150ms de debounce

    // Nettoyage
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, clients, filterClients]);

  // Fermer les suggestions quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        suggestionsRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  }, [onChange]);

  const handleSuggestionClick = useCallback((client: Client) => {
    onChange(client.nom || '');
    onClientSelect(client);
    setShowSuggestions(false);
  }, [onChange, onClientSelect]);

  const handleInputFocus = useCallback(() => {
    if (value.length >= 3 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [value, suggestions]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((client) => (
            <div
              key={client.id}
              onClick={() => handleSuggestionClick(client)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {client.nom} {client.prenom}
                </div>
                <div className="text-sm text-gray-500">
                  {client.telephone && (
                    <span>{client.telephone}</span>
                  )}
                  {client.adresse && client.telephone && (
                    <span> • </span>
                  )}
                  {client.adresse && (
                    <span>{client.adresse.substring(0, 40)}{client.adresse.length > 40 ? '...' : ''}</span>
                  )}
                </div>
              </div>
              <Check className="w-4 h-4 text-primary opacity-60" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientAutocomplete;
