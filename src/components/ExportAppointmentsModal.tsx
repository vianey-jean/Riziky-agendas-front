import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AppointmentService, Appointment } from '@/services/AppointmentService';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportAppointmentsModal: React.FC<ExportAppointmentsModalProps> = ({ isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && selectedDate) {
      loadAppointments();
    }
  }, [selectedDate, isOpen]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const allAppointments = await AppointmentService.getAll();
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const filtered = allAppointments.filter(apt => apt.date === dateStr);
      setAppointments(filtered);
      
      if (filtered.length === 0) {
        toast.error(`Aucun rendez-vous à cette date: ${format(selectedDate, 'dd/MM/yyyy')}`, {
          className: "bg-indigo-700 text-white border-indigo-600"
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rendez-vous:', error);
      toast.error('Erreur lors du chargement des rendez-vous');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    if (appointments.length === 0) return;

    const doc = new jsPDF();
    const dateStr = format(selectedDate, 'dd/MM/yyyy', { locale: fr });

    // Titre
    doc.setFontSize(18);
    doc.text(`Rendez-vous du ${dateStr}`, 14, 20);

    // Préparer les données pour le tableau
    const tableData = appointments
      .sort((a, b) => a.heure.localeCompare(b.heure))
      .map(apt => [
        apt.heure,
        `${apt.prenom || ''} ${apt.nom || ''}`.trim(),
        apt.telephone || '',
        apt.titre,
        apt.description || '',
        apt.location || '',
        `${apt.duree} min`,
        apt.statut
      ]);

    // Générer le tableau
    autoTable(doc, {
      head: [['Heure', 'Client', 'Téléphone', 'Titre', 'Description', 'Lieu', 'Durée', 'Statut']],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 35 },
        5: { cellWidth: 25 },
        6: { cellWidth: 15 },
        7: { cellWidth: 20 }
      },
      margin: { left: 5, right: 5 }
    });

    // Télécharger le PDF
    doc.save(`rendez-vous-${format(selectedDate, 'yyyy-MM-dd')}.pdf`);
    
    toast.success('PDF exporté avec succès', {
      className: "bg-indigo-700 text-white border-indigo-600"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Exporter les rendez-vous
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <label className="text-sm font-medium block">Sélectionner une date</label>
            
            <style>
              {`
                .no-spinner::-webkit-inner-spin-button,
                .no-spinner::-webkit-outer-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
                .no-spinner {
                  -moz-appearance: textfield;
                }
              `}
            </style>

            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Jour</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={selectedDate.getDate()}
                  onChange={(e) => {
                    const day = parseInt(e.target.value);
                    if (day >= 1 && day <= 31) {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(day);
                      setSelectedDate(newDate);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md bg-background no-spinner"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Mois</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={selectedDate.getMonth() + 1}
                  onChange={(e) => {
                    const month = parseInt(e.target.value) - 1;
                    if (month >= 0 && month <= 11) {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(month);
                      setSelectedDate(newDate);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md bg-background no-spinner"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Année</label>
                <input
                  type="number"
                  min="2020"
                  max="2100"
                  value={selectedDate.getFullYear()}
                  onChange={(e) => {
                    const year = parseInt(e.target.value);
                    if (year >= 2020 && year <= 2100) {
                      const newDate = new Date(selectedDate);
                      newDate.setFullYear(year);
                      setSelectedDate(newDate);
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-md bg-background no-spinner"
                />
              </div>
            </div>

            {/* Calendrier pour sélection visuelle */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: fr }) : "Choisir une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      locale={fr}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {appointments.length > 0 && (
                <div className="self-end">
                  <Button
                    onClick={exportToPDF}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Exporter
                  </Button>
                </div>
              )}
            </div>
          </div>

          {!isLoading && appointments.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
              <p className="text-sm font-medium text-indigo-900">
                {appointments.length} rendez-vous trouvé{appointments.length > 1 ? 's' : ''} pour cette date
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportAppointmentsModal;
