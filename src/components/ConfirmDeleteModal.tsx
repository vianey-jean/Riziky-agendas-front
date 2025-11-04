
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/services/AppointmentService';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  appointment: Appointment;
  isDeleting?: boolean;
}

const ConfirmDeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  appointment, 
  isDeleting = false 
}: ConfirmDeleteModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] bg-white border-0 shadow-2xl overflow-hidden rounded-2xl sm:rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-pink-50"></div>
        
        <div className="relative z-10 p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
          </button>

          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            
            <DialogTitle className="text-xl sm:text-2xl font-bold text-red-800 mb-3 sm:mb-4 px-2">
              Confirmer la suppression
            </DialogTitle>
            
            <div className="bg-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 border border-red-200">
              <p className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{appointment.titre}</p>
              <p className="text-gray-600 mb-1 text-xs sm:text-sm">{appointment.date} à {appointment.heure}</p>
              <p className="text-gray-600 text-xs sm:text-sm">{appointment.location}</p>
              {(appointment.nom || appointment.prenom) && (
                <p className="text-gray-600 text-xs sm:text-sm">
                  {appointment.prenom} {appointment.nom}
                </p>
              )}
            </div>
            
            <p className="text-red-700 font-medium mb-6 sm:mb-8 text-sm sm:text-base px-2">
              Êtes-vous sûr de vouloir supprimer ce rendez-vous ?<br />
              <span className="text-red-600 text-xs sm:text-sm">Cette action est irréversible.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isDeleting}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold rounded-xl sm:rounded-2xl transition-all duration-200 text-sm sm:text-base"
              >
                Annuler
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isDeleting}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 premium-shadow-lg font-semibold rounded-xl sm:rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteModal;
