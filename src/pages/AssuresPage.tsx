import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Eye, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { DataService } from "@/services/dataService";
import { Assure } from "@/types/insurance";

const statusStyles: Record<string, string> = {
  Actif: "bg-success/10 text-success border-success/20",
  Suspendu: "bg-warning/10 text-warning border-warning/20",
  Résilié: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function AssuresPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [assures, setAssures] = useState<Assure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssures = async () => {
      try {
        setLoading(true);
        const data = await DataService.getAssures();
        setAssures(data);
      } catch (err) {
        console.error('Error fetching assures:', err);
        setError('Erreur lors du chargement des assurés');
      } finally {
        setLoading(false);
      }
    };

    fetchAssures();
  }, []);

  const filtered = assures.filter(
    (a) =>
      a.nom.toLowerCase().includes(search.toLowerCase()) ||
      a.prenom.toLowerCase().includes(search.toLowerCase()) ||
      a.numero.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Gestion des Assurés">
      <div className="space-y-4 max-w-7xl">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-md w-full">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border border-input bg-card text-sm">
              <Search size={16} className="text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un assuré..."
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button className="p-2 rounded-lg border border-input bg-card hover:bg-muted transition-colors">
              <Filter size={16} className="text-muted-foreground" />
            </button>
          </div>
          <button onClick={() => navigate('/assures/new')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={16} />
            Nouvel assuré
          </button>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Chargement des assurés...</span>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive font-medium">Erreur</p>
            <p className="text-destructive/80 text-sm">{error}</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl shadow-card border border-border overflow-hidden"
          >
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Numéro</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nom & Prénom</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Téléphone</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Statut</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((assure, i) => (
                  <motion.tr
                    key={assure.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-xs">{assure.numero}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{assure.nom} {assure.prenom}</p>
                        <p className="text-xs text-muted-foreground">{assure.profession}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">{assure.telephone}</td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium capitalize">
                        {assure.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusStyles[assure.statut]}`}>
                        {assure.statut}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => navigate(`/assures/${assure.id}`)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
