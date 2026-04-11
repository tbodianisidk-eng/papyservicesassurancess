import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, XCircle, Clock, Banknote, AlertTriangle, Loader2, AlertCircle, FileWarning } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { DataService } from "@/services/dataService";

const statusConfig: Record<string, { icon: React.ReactNode; style: string; label: string; short: string }> = {
  EN_ATTENTE: { icon: <Clock size={13} />,        style: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "En attente", short: "Attente" },
  EN_COURS:   { icon: <AlertTriangle size={13} />, style: "bg-blue-100 text-blue-700 border-blue-200",       label: "En cours",   short: "En cours" },
  APPROUVE:   { icon: <CheckCircle size={13} />,   style: "bg-purple-100 text-purple-700 border-purple-200", label: "Approuvé",   short: "Approuvé" },
  REJETE:     { icon: <XCircle size={13} />,       style: "bg-red-100 text-red-700 border-red-200",          label: "Rejeté",     short: "Rejeté"   },
  PAYE:       { icon: <Banknote size={13} />,      style: "bg-green-100 text-green-700 border-green-200",    label: "Payé",       short: "Payé"     },
};

export default function SinistresPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sinistres, setSinistres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    DataService.getSinistres()
      .then((list) => setSinistres(list ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const assureNom = (s: any) =>
    s.assure ? `${s.assure.nom} ${s.assure.prenom}` : "";

  const filtered = sinistres.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.numero || "").toLowerCase().includes(q) ||
      assureNom(s).toLowerCase().includes(q)
    );
  });

  const counts = Object.entries(statusConfig).map(([key, cfg]) => ({
    key, label: cfg.label, style: cfg.style, icon: cfg.icon,
    count: sinistres.filter((s) => s.statut === key).length,
  }));

  return (
    <AppLayout title="Gestion des Sinistres">
      <div className="space-y-4 sm:space-y-5">

        {/* ── Compteurs statuts ──────────────────────────────────────── */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            {counts.map(({ key, label, style, icon, count }) => (
              <div key={key} className="bg-card rounded-lg p-2.5 sm:p-3 border border-border flex items-center gap-2">
                <div className={`p-1.5 rounded-lg border shrink-0 ${style}`}>{icon}</div>
                <div className="min-w-0">
                  <p className="text-base sm:text-lg font-bold leading-none">{count}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Barre de recherche ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 w-full max-w-sm">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border border-input bg-card">
            <Search size={15} className="text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-0 text-sm"
            />
          </div>
        </div>

        {/* ── États ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-muted-foreground">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm">Chargement...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-center px-4">
            <AlertCircle size={36} className="text-destructive opacity-60" />
            <p className="font-medium text-sm">Impossible de charger les sinistres</p>
            <p className="text-xs text-muted-foreground">Vérifiez que le backend est démarré</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-4">
            <FileWarning size={40} className="text-muted-foreground opacity-30" />
            <p className="font-semibold">{search ? "Aucun résultat" : "Aucun sinistre enregistré"}</p>
            {!search && (
              <p className="text-sm text-muted-foreground max-w-sm">
                Un sinistre est une déclaration de remboursement suite à des soins médicaux.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((sinistre, i) => {
              const cfg = statusConfig[sinistre.statut] ?? statusConfig.EN_ATTENTE;
              const initiales = assureNom(sinistre).split(" ").map((n: string) => n[0]).join("").slice(0, 2);
              return (
                <motion.div
                  key={sinistre.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/sinistres/${sinistre.id}`)}
                  className="bg-card rounded-xl p-4 sm:p-5 border border-border hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* En-tête */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0 text-sm">
                        {initiales || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate text-sm sm:text-base">{assureNom(sinistre) || "Assuré inconnu"}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">{sinistre.numero}</p>
                        {sinistre.police && (
                          <p className="text-xs text-muted-foreground truncate">Police : {sinistre.police.numero}</p>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-medium shrink-0 whitespace-nowrap ${cfg.style}`}>
                      {cfg.icon}
                      <span>{cfg.short}</span>
                    </span>
                  </div>

                  {/* Montants */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 border-t pt-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Date sinistre</p>
                      <p className="font-medium text-xs sm:text-sm">
                        {sinistre.dateSinistre
                          ? new Date(sinistre.dateSinistre).toLocaleDateString("fr-FR")
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Réclamé</p>
                      <p className="font-medium text-xs sm:text-sm truncate">
                        {sinistre.montantReclamation != null
                          ? Number(sinistre.montantReclamation).toLocaleString("fr-FR") + " F"
                          : "—"}
                      </p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-muted-foreground text-xs">Accordé</p>
                      <p className="font-semibold text-green-600 text-xs sm:text-sm truncate">
                        {sinistre.montantAccorde != null
                          ? Number(sinistre.montantAccorde).toLocaleString("fr-FR") + " F"
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {sinistre.description && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                      {sinistre.description}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
