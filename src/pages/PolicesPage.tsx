import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Eye, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { DataService } from "@/services/dataService";

const statusStyles: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Suspendue: "bg-warning/10 text-warning border-warning/20",
  Expirée: "bg-muted text-muted-foreground border-border",
};

export default function PolicesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [polices, setPolices] = useState<any[]>([]);

  useEffect(() => {
    const loadPolices = async () => {
      try {
        const list = await DataService.getPolices();
        setPolices(list);
      } catch (error) {
        console.error('PolicesPage: impossible de charger les polices', error);
      }
    };
    loadPolices();
  }, []);

  const filtered = polices.filter(
    (p) =>
      p.numero.toLowerCase().includes(search.toLowerCase()) ||
      p.assurePrincipal.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Gestion des Polices">
      <div className="space-y-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 max-w-md w-full">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border border-input bg-card text-sm">
              <Search size={16} className="text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une police..."
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button className="p-2 rounded-lg border border-input bg-card hover:bg-muted transition-colors">
              <Filter size={16} className="text-muted-foreground" />
            </button>
          </div>
          <button onClick={() => navigate('/polices/new')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus size={16} />
            Nouvelle police
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((police, i) => (
            <motion.div
              key={police.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-card rounded-xl p-5 shadow-card border border-border hover:shadow-elevated transition-shadow cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{police.numero}</p>
                  <p className="font-display font-semibold mt-0.5">{police.assurePrincipal}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusStyles[police.statut] || statusStyles.Active}`}>
                  {police.statut}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{police.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cotisation</span>
                  <span className="font-medium">{police.montantCotisation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Période</span>
                  <span className="text-xs">{police.dateDebut} → {police.dateFin}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                <Users size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{police.nbBeneficiaires} bénéficiaires</span>
                <div className="flex-1" />
                <button className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Voir détails →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
