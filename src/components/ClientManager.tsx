
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Search, Phone, Mail, MapPin, Edit, Trash2, UserCheck, Crown, Star } from 'lucide-react';
import { Client, ClientService } from '@/services/ClientService';

const ClientManager: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    dateNaissance: '',
    notes: ''
  });

  // Charger les clients depuis la base de données
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    const clientsData = await ClientService.getAllClients();
    setClients(clientsData);
    setIsLoading(false);
  };

  const filteredClients = clients.filter(client =>
    `${client.prenom} ${client.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone.includes(searchTerm)
  );

  const handleAddClient = async () => {
    if (!formData.nom || !formData.prenom) {
      return;
    }

    const success = await ClientService.addClient(formData);
    if (success) {
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        dateNaissance: '',
        notes: ''
      });
      setIsAddDialogOpen(false);
      loadClients();
    }
  };

  const handleEditClient = async () => {
    if (!selectedClient) return;

    const success = await ClientService.updateClient(selectedClient.id, formData);
    if (success) {
      setIsEditDialogOpen(false);
      setSelectedClient(null);
      loadClients();
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    const success = await ClientService.deleteClient(clientId);
    if (success) {
      loadClients();
    }
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone,
      adresse: client.adresse,
      dateNaissance: client.dateNaissance || '',
      notes: client.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      dateNaissance: '',
      notes: ''
    });
  };

  return (
    <div className="space-y-8">
      {/* En-tête premium */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 premium-gradient rounded-2xl premium-shadow-xl mb-6 relative overflow-hidden floating-animation">
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
          <Users className="w-10 h-10 text-white relative z-10" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Crown className="w-4 h-4 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold luxury-text-gradient mb-2">Gestion des Clients</h2>
        <p className="text-muted-foreground font-medium">Base de données clients complète</p>
      </div>

      {/* Actions et recherche */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 luxury-card border-primary/20"
          />
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="premium-gradient text-white hover:opacity-90 transition-all duration-300 premium-shadow">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Client
            </Button>
          </DialogTrigger>
          <DialogContent className="luxury-card max-w-2xl">
            <DialogHeader>
              <DialogTitle className="luxury-text-gradient">Ajouter un nouveau client</DialogTitle>
              <DialogDescription>
                Remplissez les informations du client
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom" className='text-black font-bold'>Prénom *</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  className="luxury-card border-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nom" className='text-black font-bold'>Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  className="luxury-card border-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className='text-black font-bold'>Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="luxury-card border-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telephone" className='text-black font-bold'>Téléphone</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  className="luxury-card border-primary/20"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="adresse" className='text-black font-bold'>Adresse</Label>
                <Input
                  id="adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                  className="luxury-card border-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateNaissance" className='text-black font-bold'>Date de naissance</Label>
                <Input
                  id="dateNaissance"
                  type="date"
                  value={formData.dateNaissance}
                  onChange={(e) => setFormData({...formData, dateNaissance: e.target.value})}
                  className="luxury-card border-primary/20"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes" className='text-black font-bold'>Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="text-black luxury-card border-primary/20"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddClient} className="premium-gradient text-white" disabled={isLoading}>
                Ajouter le client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de modification */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="luxury-card max-w-2xl">
            <DialogHeader>
              <DialogTitle className="luxury-text-gradient">Modifier le client</DialogTitle>
              <DialogDescription>
                Modifiez les informations du client
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-prenom" className='text-black font-bold'>Prénom *</Label>
                <Input
                  id="edit-prenom"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  className="luxury-card border-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-nom" className='text-black font-bold'>Nom *</Label>
                <Input
                  id="edit-nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  className="luxury-card border-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email" className='text-black font-bold'>Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="luxury-card border-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-telephone" className='text-black font-bold'>Téléphone</Label>
                <Input
                  id="edit-telephone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  className="luxury-card border-primary/20"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-adresse" className='text-black font-bold'>Adresse</Label>
                <Input
                  id="edit-adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                  className="luxury-card border-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-dateNaissance" className='text-black font-bold'>Date de naissance</Label>
                <Input
                  id="edit-dateNaissance"
                  type="date"
                  value={formData.dateNaissance}
                  onChange={(e) => setFormData({...formData, dateNaissance: e.target.value})}
                  className="luxury-card border-primary/20"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="edit-notes" className='text-black font-bold'>Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="luxury-card text-black border-primary/20"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleEditClient} className="premium-gradient text-white" disabled={isLoading}>
                Modifier le client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des clients */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Chargement des clients...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => (
            <Card key={client.id} className="luxury-card premium-hover glow-effect relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-3xl"></div>
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
                      {client.prenom} {client.nom}
                      {client.totalRendezVous > 10 && <Star className="w-4 h-4 text-yellow-500" />}
                    </CardTitle>
                    <div className="mt-1">
                      <Badge variant={client.status === 'actif' ? 'default' : 'secondary'} className="text-xs">
                        {client.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className=" h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                      onClick={() => openEditDialog(client)}
                    >
                      <Edit className="w-4 h-4 text-green-900" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {client.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-black" />
                    <span className="truncate text-black">{client.email}</span>
                  </div>
                )}
                
                {client.telephone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-black" />
                    <span className='text-black'>{client.telephone}</span>
                  </div>
                )}
                
                {client.adresse && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-black" />
                    <span className="truncate text-black">{client.adresse}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <UserCheck className="w-4 h-4 text-black" />
                  <span className='text-black'>{client.totalRendezVous} rendez-vous</span>
                </div>
                
                {client.derniereVisite && (
                  <div className="text-xs text-black">
                    Dernière visite: {new Date(client.derniereVisite).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredClients.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">Aucun client trouvé</h3>
          <p className="text-sm text-muted-foreground">
            {searchTerm ? 'Aucun client ne correspond à votre recherche.' : 'Commencez par ajouter votre premier client.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientManager;
