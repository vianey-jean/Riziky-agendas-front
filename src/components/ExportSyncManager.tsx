
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppointmentService } from '@/services/AppointmentService';
import { Download, Upload, Calendar, FileText, Mail, Smartphone, Cloud, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ExportSyncManager: React.FC = () => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'ical'>('csv');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [isExporting, setIsExporting] = useState(false);
  const [syncSettings, setSyncSettings] = useState({
    googleCalendar: false,
    outlookCalendar: false,
    emailReminders: true,
    smsReminders: false
  });

  const exportAppointments = async () => {
    setIsExporting(true);
    try {
      const appointments = await AppointmentService.getAllWithStatus();
      
      let filteredAppointments = appointments;
      const now = new Date();
      
      // Filtrer par période
      if (dateRange !== 'all') {
        const cutoffDate = new Date();
        switch (dateRange) {
          case 'week':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            cutoffDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        filteredAppointments = appointments.filter(apt => 
          new Date(apt.date) >= cutoffDate
        );
      }

      let content: string;
      let filename: string;
      let mimeType: string;

      switch (exportFormat) {
        case 'csv':
          content = generateCSV(filteredAppointments);
          filename = `rendez-vous-${format(now, 'yyyy-MM-dd')}.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          content = JSON.stringify(filteredAppointments, null, 2);
          filename = `rendez-vous-${format(now, 'yyyy-MM-dd')}.json`;
          mimeType = 'application/json';
          break;
        case 'ical':
          content = generateICalendar(filteredAppointments);
          filename = `rendez-vous-${format(now, 'yyyy-MM-dd')}.ics`;
          mimeType = 'text/calendar';
          break;
        default:
          throw new Error('Format non supporté');
      }

      // Télécharger le fichier
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Export réussi !', {
        description: `${filteredAppointments.length} rendez-vous exportés en ${exportFormat.toUpperCase()}`
      });

    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur lors de l\'export', {
        description: 'Impossible d\'exporter les rendez-vous'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = (appointments: any[]) => {
    const headers = [
      'ID', 'Titre', 'Description', 'Date', 'Heure', 'Durée (min)', 
      'Lieu', 'Statut', 'Nom', 'Prénom', 'Téléphone', 'Date de naissance'
    ];
    
    const csvContent = [
      headers.join(','),
      ...appointments.map(apt => [
        apt.id,
        `"${apt.titre}"`,
        `"${apt.description}"`,
        apt.date,
        apt.heure,
        apt.duree,
        `"${apt.location}"`,
        apt.statut,
        `"${apt.nom || ''}"`,
        `"${apt.prenom || ''}"`,
        `"${apt.telephone || ''}"`,
        `"${apt.dateNaissance || ''}"`
      ].join(','))
    ].join('\n');
    
    return csvContent;
  };

  const generateICalendar = (appointments: any[]) => {
    const now = new Date();
    const timestamp = format(now, "yyyyMMdd'T'HHmmss'Z'");
    
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Riziky Agendas//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    appointments.forEach(apt => {
      const startDateTime = new Date(`${apt.date} ${apt.heure}`);
      const endDateTime = new Date(startDateTime.getTime() + (apt.duree * 60000));
      
      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${apt.id}@riziky-agendas.com`,
        `DTSTAMP:${timestamp}`,
        `DTSTART:${format(startDateTime, "yyyyMMdd'T'HHmmss")}`,
        `DTEND:${format(endDateTime, "yyyyMMdd'T'HHmmss")}`,
        `SUMMARY:${apt.titre}`,
        `DESCRIPTION:${apt.description.replace(/\n/g, '\\n')}`,
        `LOCATION:${apt.location}`,
        `STATUS:${apt.statut === 'validé' ? 'CONFIRMED' : apt.statut === 'annulé' ? 'CANCELLED' : 'TENTATIVE'}`,
        'END:VEVENT'
      );
    });

    icalContent.push('END:VCALENDAR');
    return icalContent.join('\r\n');
  };

  const syncWithGoogleCalendar = () => {
    toast.info('Synchronisation Google Calendar', {
      description: 'Cette fonctionnalité nécessite une configuration API'
    });
  };

  const syncWithOutlook = () => {
    toast.info('Synchronisation Outlook', {
      description: 'Cette fonctionnalité nécessite une configuration API'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-primary">Export & Synchronisation</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Exportez vos données et synchronisez avec d'autres calendriers</p>
        </div>
      </div>

      {/* Export */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            Exporter les rendez-vous
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Téléchargez vos rendez-vous dans différents formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Format d'export</Label>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv" className="text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      CSV (Excel)
                    </div>
                  </SelectItem>
                  <SelectItem value="json" className="text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      JSON (Données)
                    </div>
                  </SelectItem>
                  <SelectItem value="ical" className="text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      iCalendar (.ics)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Période</Label>
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week" className="text-sm sm:text-base">7 derniers jours</SelectItem>
                  <SelectItem value="month" className="text-sm sm:text-base">30 derniers jours</SelectItem>
                  <SelectItem value="year" className="text-sm sm:text-base">12 derniers mois</SelectItem>
                  <SelectItem value="all" className="text-sm sm:text-base">Tous les rendez-vous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={exportAppointments} disabled={isExporting} className="gap-2 w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base">
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            {isExporting ? 'Export en cours...' : 'Exporter'}
          </Button>
        </CardContent>
      </Card>

      {/* Synchronisation */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            Synchronisation calendriers
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Synchronisez avec vos calendriers externes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <Card className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="font-medium text-sm sm:text-base">Google Calendar</span>
                </div>
                <Badge variant="outline" className="text-xs">Beta</Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                Synchronisez automatiquement avec votre agenda Google
              </p>
              <Button onClick={syncWithGoogleCalendar} variant="outline" size="sm" className="w-full text-xs sm:text-sm h-8 sm:h-9">
                Configurer
              </Button>
            </Card>

            <Card className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-800" />
                  <span className="font-medium text-sm sm:text-base">Outlook Calendar</span>
                </div>
                <Badge variant="outline" className="text-xs">Beta</Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                Synchronisez avec Microsoft Outlook
              </p>
              <Button onClick={syncWithOutlook} variant="outline" size="sm" className="w-full text-xs sm:text-sm h-8 sm:h-9">
                Configurer
              </Button>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            Notifications automatiques
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Configurez les rappels et confirmations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base">Rappels par email</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Envoyer des rappels 24h avant</p>
                </div>
              </div>
              <Badge variant={syncSettings.emailReminders ? "default" : "secondary"} className="text-xs flex-shrink-0">
                {syncSettings.emailReminders ? "Activé" : "Désactivé"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 border rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base">Rappels par SMS</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">SMS 2h avant le rendez-vous</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">Bientôt</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportSyncManager;
