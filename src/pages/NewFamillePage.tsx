import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { DataService } from "@/services/dataService";

export default function NewFamillePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    principal: "",
    telephone: "",
    dateDebut: "",
    dateFin: "",
    prime: ""
  });
  const [beneficiaires, setBeneficiaires] = useState([{ nom: "", lien: "" }]);

  const addBeneficiaire = () => {
    setBeneficiaires([...beneficiaires, { nom: "", lien: "" }]);
  };

  const removeBeneficiaire = (index: number) => {
    setBeneficiaires(beneficiaires.filter((_, i) => i !== index));
  };

  const updateBeneficiaire = (index: number, field: string, value: string) => {
    const updated = [...beneficiaires];
    updated[index] = { ...updated[index], [field]: value };
    setBeneficiaires(updated);
  };

  useEffect(() => {
    const idParam = Number(searchParams.get('id'));
    if (idParam) {
      setEditingId(idParam);
      DataService.getFamilleById(idParam)
        .then((famille) => {
          if (famille) {
            setFormData({
              principal: famille.principal || "",
              telephone: famille.telephone || "",
              dateDebut: famille.dateDebut || "",
              dateFin: famille.dateFin || "",
              prime: famille.prime || ""
            });
            setBeneficiaires(
              (famille.beneficiaires || []).map((b: string) => {
                const match = b.match(/^(.+) \((.+)\)$/);
                if (match) return { nom: match[1], lien: match[2] };
                return { nom: b, lien: "" };
              })
            );
          }
        })
        .catch((error) => {
          console.error(error);
          toast.error("Erreur lors du chargement de la famille à modifier");
        });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await DataService.updateFamille(editingId, {
          principal: formData.principal,
          telephone: formData.telephone,
          beneficiaires: beneficiaires.map((b) => `${b.nom} (${b.lien})`),
          dateDebut: formData.dateDebut,
          dateFin: formData.dateFin,
          prime: formData.prime,
        });
        toast.success("Famille modifiée avec succès");
      } else {
        await DataService.createFamille({
          principal: formData.principal,
          telephone: formData.telephone,
          beneficiaires: beneficiaires.map((b) => `${b.nom} (${b.lien})`),
          dateDebut: formData.dateDebut,
          dateFin: formData.dateFin,
          prime: formData.prime,
        });
        toast.success("Famille créée avec succès");
      }
      navigate("/maladie-famille");
    } catch (error: any) {
      toast.error(error?.message || `Erreur lors de la ${editingId ? "modification" : "création"} de la famille`);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/maladie-famille")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">{editingId ? 'Modifier la Famille' : 'Nouvelle Famille'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Assuré Principal</h3>
              <div>
                <Label>Nom complet</Label>
                <Input
                  required
                  value={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                  placeholder="Amadou Diallo"
                />
              </div>
              <div>
                <Label>Téléphone</Label>
                <Input
                  required
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="+221771234567 ou +221 77 123 45 67"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">Bénéficiaires</h3>
                <Button type="button" variant="outline" size="sm" onClick={addBeneficiaire}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
              {beneficiaires.map((ben, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    required
                    placeholder="Nom du bénéficiaire"
                    value={ben.nom}
                    onChange={(e) => updateBeneficiaire(idx, "nom", e.target.value)}
                  />
                  <Input
                    required
                    placeholder="Lien (Époux, Fils, Fille...)"
                    value={ben.lien}
                    onChange={(e) => updateBeneficiaire(idx, "lien", e.target.value)}
                  />
                  {beneficiaires.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeBeneficiaire(idx)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date début</Label>
                <Input
                  required
                  type="date"
                  value={formData.dateDebut}
                  onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                />
              </div>
              <div>
                <Label>Date fin</Label>
                <Input
                  required
                  type="date"
                  value={formData.dateFin}
                  onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Prime annuelle (FCFA)</Label>
              <Input
                required
                type="number"
                value={formData.prime}
                onChange={(e) => setFormData({ ...formData, prime: e.target.value })}
                placeholder="850000"
              />
            </div>

            <Button type="submit" className="w-full btn-ripple bg-gradient-to-r from-blue-600 to-purple-600">
              {editingId ? 'Modifier la famille' : 'Créer la famille'}
            </Button>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
