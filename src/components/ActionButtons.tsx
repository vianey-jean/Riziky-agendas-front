
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Search, Sparkles, Crown, FileDown } from 'lucide-react';

/**
 * Props pour les boutons d'action
 */
type ActionButtonsProps = {
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSearch: () => void;
  onExport?: () => void;
};

/**
 * Composant pour afficher les boutons d'action du tableau de bord
 * Permet d'ajouter, modifier, supprimer et rechercher des rendez-vous
 */
const ActionButtons = ({ onAdd, onEdit, onDelete, onSearch, onExport }: ActionButtonsProps) => {
  return (
    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-2 sm:px-0">
      <Button 
        className="group flex items-center justify-center gap-2 sm:gap-3 btn-premium premium-shadow-lg rounded-xl sm:rounded-2xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold tracking-wide glow-effect premium-hover w-full sm:w-auto" 
        onClick={onAdd}
      >
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center">
          <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
        </div>
        <span className="hidden sm:inline">Ajouter un rendez-vous</span>
        <span className="sm:hidden">Ajouter</span>
        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>

      <Button 
        variant="outline"
        className="group flex items-center justify-center gap-2 sm:gap-3 luxury-card premium-shadow rounded-xl sm:rounded-2xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold tracking-wide border-2 border-primary/20 hover:border-primary/40 text-primary hover:text-primary/80 premium-hover glow-effect w-full sm:w-auto" 
        onClick={onEdit}
      >
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary/10 rounded-full flex items-center justify-center">
          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
        </div>
        <span className="hidden sm:inline">Modifier un rendez-vous</span>
        <span className="sm:hidden">Modifier</span>
        <Crown className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>

      <Button 
        variant="destructive" 
        className="group flex items-center justify-center gap-2 sm:gap-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 premium-shadow-lg rounded-xl sm:rounded-2xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold tracking-wide premium-hover glow-effect w-full sm:w-auto" 
        onClick={onDelete}
      >
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center">
          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
        </div>
        <span className="hidden sm:inline">Supprimer un rendez-vous</span>
        <span className="sm:hidden">Supprimer</span>
        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>

      <Button 
        variant="outline"
        className="group flex items-center justify-center gap-2 sm:gap-3 luxury-card premium-shadow rounded-xl sm:rounded-2xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold tracking-wide border-2 border-purple-300 hover:border-purple-400 text-purple-600 hover:text-purple-700 premium-hover glow-effect w-full sm:w-auto" 
        onClick={onSearch}
      >
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-100 rounded-full flex items-center justify-center">
          <Search className="h-3 w-3 sm:h-4 sm:w-4" />
        </div>
        <span className="hidden sm:inline">Rechercher un rendez-vous</span>
        <span className="sm:hidden">Rechercher</span>
        <Crown className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>

      {onExport && (
        <Button 
          variant="outline"
          className="group flex items-center justify-center gap-2 sm:gap-3 luxury-card premium-shadow rounded-xl sm:rounded-2xl px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold tracking-wide border-2 border-green-300 hover:border-green-400 text-green-600 hover:text-green-700 premium-hover glow-effect w-full sm:w-auto" 
          onClick={onExport}
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center">
            <FileDown className="h-3 w-3 sm:h-4 sm:w-4" />
          </div>
          <span className="hidden sm:inline">Exporter rendez-vous</span>
          <span className="sm:hidden">Exporter</span>
          <Crown className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
