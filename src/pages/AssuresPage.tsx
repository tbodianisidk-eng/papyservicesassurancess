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
      <div className="space-y-4 w-full">
        {/* Actions bar */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-full sm:max-w-md">
            <div className="flex items-center gap-2 flex-1 px-2 sm:px-3 py-2 rounded-lg border border-input bg-card text-xs sm:text-sm">
              <Search size={14} className="text-muted-foreground flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-0"
              />
            </div>
            <button className="p-2 rounded-lg border border-input bg-card hover:bg-muted transition-colors flex-shrink-0">
              <Filter size={14} className="text-muted-foreground" />
            </button>
          </div>
          <button onClick={() => navigate('/assures/new')} className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs sm:text-sm font-medium shadow-sm hover:shadow-md active:scale-95 transition-all duration-150 whitespace-nowrap shrink-0">
            <Plus size={14} />
            <span className="hidden sm:inline">Nouvel assuré</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-xs sm:text-sm text-muted-foreground">Chargement...</span>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 sm:p-4">
            <p className="text-destructive font-medium text-sm">Erreur</p>
            <p className="text-destructive/80 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        {/* Table - Responsive Design */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl shadow-card border border-border overflow-hidden"
          >
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground min-w-[100px]">Numéro</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground min-w-[150px] xl:min-w-[200px]">Nom & Prénom</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground hidden lg:table-cell min-w-[120px] xl:min-w-[140px]">Téléphone</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground hidden xl:table-cell min-w-[80px]">Type</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground hidden 2xl:table-cell min-w-[120px]">Profession</th>
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground min-w-[100px]">Statut</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-muted-foreground min-w-[60px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((assure, i) => (
                    <motion.tr
                      key={assure.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="py-2 sm:py-3 px-2 sm:px-4 font-mono text-xs">{assure.numero}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate">{assure.nom} {assure.prenom}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block xl:hidden truncate">{assure.profession}</p>
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 hidden lg:table-cell text-muted-foreground text-xs sm:text-sm truncate">{assure.telephone}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 hidden xl:table-cell">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium capitalize whitespace-nowrap">
                          {assure.type}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 hidden 2xl:table-cell text-muted-foreground text-xs sm:text-sm truncate">{assure.profession}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <span className={`text-xs px-2 sm:px-2.5 py-1 rounded-full border font-medium whitespace-nowrap ${statusStyles[assure.statut]}`}>
                          {assure.statut}
                        </span>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                        <button
                          onClick={() => navigate(`/assures/${assure.id}`)}
                          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-2 sm:p-4">
              {filtered.map((assure, i) => (
                <motion.div
                  key={assure.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/assures/${assure.id}`)}
                  className="p-3 sm:p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer space-y-3 bg-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-muted-foreground mb-1">{assure.numero}</p>
                      <p className="font-medium text-sm sm:text-base truncate">{assure.nom} {assure.prenom}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{assure.profession}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium flex-shrink-0 whitespace-nowrap ${statusStyles[assure.statut]}`}>
                      {assure.statut}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="truncate max-w-[120px] sm:max-w-none">{assure.telephone}</span>
                      <span className="text-muted-foreground/60">•</span>
                      <span className="capitalize whitespace-nowrap">{assure.type}</span>
                    </div>
                    <Eye size={16} className="text-muted-foreground flex-shrink-0" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty state */}
            {filtered.length === 0 && !loading && !error && (
              <div className="flex items-center justify-center py-12">
                <p className="text-center text-muted-foreground text-xs sm:text-sm">Aucun assuré trouvé</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
