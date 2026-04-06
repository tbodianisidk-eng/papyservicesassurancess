import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { DataService } from "@/services/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Building2, Users, TrendingUp, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const initialGroupes = [
  {
    id: 1,
    entreprise: "Sonatel SA",
    secteur: "Télécommunications",
    employes: 450,
    assures: 1350,
    debut: "2024-01-01",
    fin: "2024-12-31",
    prime: "45000000",
    statut: "Actif"
  }
];

export default function MaladieGroupePage() {
  const navigate = useNavigate();
  const [groupes, setGroupes] = useState<any[]>(initialGroupes);
  const [search, setSearch] = useState("");

  useEffect(() => {
    DataService.getGroupes().then(setGroupes).catch((error) => console.error(error));
  }, []);

  const onDeleteGroupe = async (id: number) => {
    await DataService.deleteGroupe(id);
    setGroupes((prev) => prev.filter((g) => g.id !== id));
  };

  const onEditGroupe = (id: number) => {
    navigate(`/maladie-groupe/new?id=${id}`);
  };

  const filtered = groupes.filter((g) =>
    g.entreprise.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: groupes.length,
    actifs: groupes.filter(g => g.statut === "Actif").length,
    totAssures: groupes.reduce((sum, g) => sum + Number(g.assures || 0), 0),
    primeTotale: groupes.reduce((sum, g) => sum + Number(g.prime || 0), 0)
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Maladie Groupe</h1>
            <p className="text-muted-foreground">Gestion des polices pour entreprises</p>
          </div>
          <Button className="btn-ripple bg-gradient-to-r from-blue-600 to-purple-600" onClick={() => navigate("/maladie-groupe/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Groupe
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Entreprises</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold">{stats.actifs}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Assurés</p>
                <p className="text-2xl font-bold">{stats.totAssures}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prime annuelle totale</p>
                <p className="text-2xl font-bold">{stats.primeTotale.toLocaleString()} FCFA</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher une entreprise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid gap-4">
          {filtered.map((groupe, i) => (
            <motion.div
              key={groupe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{groupe.entreprise}</h3>
                      <Badge variant={groupe.statut === "Actif" ? "default" : "secondary"}>
                        {groupe.statut}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{groupe.secteur}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Employés</p>
                        <p className="font-semibold">{groupe.employes}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Assurés</p>
                        <p className="font-semibold">{groupe.assures}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Prime annuelle</p>
                        <p className="font-semibold">{parseInt(groupe.prime).toLocaleString()} FCFA</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Période</p>
                        <p className="font-semibold text-sm">{new Date(groupe.debut).getFullYear()}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button onClick={() => onEditGroupe(groupe.id)} variant="outline" size="sm">
                        <Pencil className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                      <Button onClick={() => onDeleteGroupe(groupe.id)} variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
