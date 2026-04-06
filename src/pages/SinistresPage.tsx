import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Banknote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { DataService } from "@/services/dataService";

const statusConfig: Record<string, { icon: React.ReactNode; style: string }> = {
  "En attente": { icon: <Clock size={14} />, style: "bg-warning/10 text-warning border-warning/20" },
  Validé: { icon: <CheckCircle size={14} />, style: "bg-info/10 text-info border-info/20" },
  Rejeté: { icon: <XCircle size={14} />, style: "bg-destructive/10 text-destructive border-destructive/20" },
  Payé: { icon: <Banknote size={14} />, style: "bg-success/10 text-success border-success/20" },
};

export default function SinistresPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sinistres, setSinistres] = useState<any[]>([]);

  useEffect(() => {
    const loadSinistres = async () => {
      try {
        const list = await DataService.getSinistres();
        setSinistres(list);
      } catch (error) {
        console.error('SinistresPage: impossible de charger les sinistres', error);
      }
    };
    loadSinistres();
  }, []);

  const filtered = sinistres.filter(
    (s) =>
      s.numero.toLowerCase().includes(search.toLowerCase()) ||
      s.assure.toLowerCase().includes(search.toLowerCase())
  );

  const statusCounts = Object.entries(statusConfig).map(([label]) => ({
    label,
    count: sinistres.filter((s) => s.statut === label).length,
  }));

  return (
    <AppLayout title="Gestion des Sinistres">
      <div className="space-y-4 max-w-7xl">
        {/* Stats mini */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statusCounts.map(({ label, count }) => {
            const config = statusConfig[label];
            return (
              <div key={label} className="bg-card rounded-lg p-3 border border-border flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.style}`}>{config.icon}</div>
                <div>
                  <p className="text-lg font-display font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 max-w-md">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border border-input bg-card text-sm">
            <Search size={16} className="text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un sinistre..."
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">Aucun sinistre trouvé</Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((sinistre, i) => {
              const config = statusConfig[sinistre.statut] || statusConfig['En attente'];
              return (
                <motion.div
                  key={sinistre.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/sinistres/${sinistre.id}`)}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {(sinistre.assure || '').split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{sinistre.assure}</p>
                          <p className="text-sm text-muted-foreground font-mono">{sinistre.numero}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border font-medium ${config.style}`}>
                        {config.icon}
                        {sinistre.statut}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{sinistre.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">{sinistre.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Montant réclamé</p>
                        <p className="font-semibold text-blue-600">{sinistre.montantReclame}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
