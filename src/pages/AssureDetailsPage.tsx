import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, Shield, Edit, Trash2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataService } from "@/services/dataService";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AssureDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assure, setAssure] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const loadAssure = async () => {
      if (!id) {
        setError('ID invalide');
        setLoading(false);
        return;
      }
      try {
        const found = await DataService.getAssureById(id);
        setAssure(found);
        setFormData(found);
      } catch (err) {
        console.error('AssureDetailsPage: impossible de charger l’assuré', err);
        setError('Erreur lors du chargement de l’assuré');
      } finally {
        setLoading(false);
      }
    };
    loadAssure();
  }, [id]);

  if (loading) {
    return <AppLayout title="Chargement...">Chargement en cours...</AppLayout>;
  }

  if (error || !assure) {
    return <AppLayout title="Assuré introuvable"><p>{error ?? 'Assuré non trouvé'}</p></AppLayout>;
  }

  const handleUpdate = () => {
    alert("Assuré modifié avec succès !");
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm("Voulez-vous vraiment supprimer cet assuré ?")) {
      alert("Assuré supprimé avec succès !");
      navigate('/assures');
    }
  };

  return (
    <AppLayout title={`${assure.nom} ${assure.prenom}`}>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/assures')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="w-4 h-4 mr-2" /> {isEditing ? 'Annuler' : 'Modifier'}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" /> Supprimer
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
              {assure.nom[0]}{assure.prenom[0]}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nom</Label>
                      <Input value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} />
                    </div>
                    <div>
                      <Label>Prénom</Label>
                      <Input value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <Label>Profession</Label>
                    <Input value={formData.profession} onChange={(e) => setFormData({...formData, profession: e.target.value})} />
                  </div>
                  <Button onClick={handleUpdate}>Enregistrer</Button>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-2">{assure.nom} {assure.prenom}</h2>
                  <p className="text-muted-foreground mb-4">{assure.profession}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success border border-success/20">
                    <Shield className="w-4 h-4" />
                    {assure.statut}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Informations personnelles</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{assure.telephone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{assure.numero}@asc.fr</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{assure.adresse || 'Dakar, Sénégal'}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Informations d'assurance</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Numéro d'assuré</p>
                <p className="font-mono font-semibold">{assure.numero}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type de contrat</p>
                <p className="font-semibold capitalize">{assure.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date d'adhésion</p>
                <p>01/01/2023</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
