import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Calendar, Stethoscope, FileText, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { DataService } from "@/services/dataService";

const statusConfig: Record<string, { style: string; label: string; dot: string }> = {
  PROGRAMMEE: { style: "bg-blue-100 text-blue-700 border-blue-200",   label: "Programmée", dot: "bg-blue-500"  },
  COMPLETEE:  { style: "bg-green-100 text-green-700 border-green-200", label: "Effectuée",  dot: "bg-green-500" },
  ANNULEE:    { style: "bg-red-100 text-red-700 border-red-200",       label: "Annulée",    dot: "bg-red-500"   },
};

export default function ConsultationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    DataService.getConsultations()
      .then((list) => setConsultations(list ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const assureNom = (c: any) =>
    c.assure ? `${c.assure.nom} ${c.assure.prenom}` : "";

  const filtered = consultations.filter((c) => {
    const q = search.toLowerCase();
    return (
      assureNom(c).toLowerCase().includes(q) ||
      (c.prestataire?.nom || "").toLowerCase().includes(q) ||
      (c.motif || "").toLowerCase().includes(q)
    );
  });

  const counts = {
    PROGRAMMEE: consultations.filter((c) => c.statut === "PROGRAMMEE").length,
    COMPLETEE:  consultations.filter((c) => c.statut === "COMPLETEE").length,
    ANNULEE:    consultations.filter((c) => c.statut === "ANNULEE").length,
  };

  return (
    <AppLayout title="Suivi des Consultations">
      <div className="space-y-4 sm:space-y-5">

        {/* ── Compteurs ──────────────────────────────────────────────── */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {([
              { key: "PROGRAMMEE", bg: "bg-blue-50",  border: "border-blue-200",  iconBg: "bg-blue-600",  num: "text-blue-900",  sub: "text-blue-700",  icon: <Calendar size={15} /> },
              { key: "COMPLETEE",  bg: "bg-green-50", border: "border-green-200", iconBg: "bg-green-600", num: "text-green-900", sub: "text-green-700", icon: <FileText size={15} /> },
              { key: "ANNULEE",    bg: "bg-red-50",   border: "border-red-200",   iconBg: "bg-red-600",   num: "text-red-900",  sub: "text-red-700",  icon: <FileText size={15} /> },
            ] as const).map(({ key, bg, border, iconBg, num, sub, icon }) => (
              <div key={key} className={`${bg} border ${border} rounded-xl p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${iconBg} rounded-lg flex items-center justify-center text-white shrink-0`}>
                  {icon}
                </div>
                <div className="min-w-0">
                  <p className={`text-lg sm:text-2xl font-bold ${num} leading-none`}>{counts[key]}</p>
                  <p className={`text-xs sm:text-sm ${sub} truncate mt-0.5`}>{statusConfig[key].label}s</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Barre d'actions ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 sm:max-w-md">
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
          <Button
            className="whitespace-nowrap shrink-0"
            onClick={() => navigate("/consultations/new")}
          >
            <Plus size={15} className="mr-1.5" />
            <span className="hidden sm:inline">Nouvelle consultation</span>
            <span className="sm:hidden">Nouvelle</span>
          </Button>
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
            <p className="font-medium text-sm">Impossible de charger les consultations</p>
            <p className="text-xs text-muted-foreground">Vérifiez que le backend est démarré</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-4">
            <Stethoscope size={40} className="text-muted-foreground opacity-30" />
            <p className="font-semibold">{search ? "Aucun résultat" : "Aucune consultation enregistrée"}</p>
            {!search && (
              <p className="text-sm text-muted-foreground max-w-sm">
                Les consultations sont les visites médicales des assurés chez les prestataires partenaires.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c, i) => {
              const cfg = statusConfig[c.statut] ?? statusConfig.COMPLETEE;
              const initiales = assureNom(c).split(" ").map((n: string) => n[0]).join("").slice(0, 2);
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl p-4 sm:p-5 border border-border hover:shadow-md transition-shadow"
                >
                  {/* En-tête */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0 text-sm">
                        {initiales || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate text-sm sm:text-base">{assureNom(c) || "Assuré inconnu"}</p>
                        {c.prestataire && (
                          <p className="text-xs text-muted-foreground truncate">{c.prestataire.nom}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border font-medium shrink-0 whitespace-nowrap ${cfg.style}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Détails */}
                  <div className="space-y-1.5 text-sm">
                    {c.dateConsultation && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={13} className="shrink-0" />
                        <span className="text-xs sm:text-sm">
                          {new Date(c.dateConsultation).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                        </span>
                      </div>
                    )}
                    {c.motif && (
                      <div className="flex items-start gap-2">
                        <Stethoscope size={13} className="text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Motif : <span className="text-foreground">{c.motif}</span>
                        </span>
                      </div>
                    )}
                    {c.diagnostic && (
                      <div className="flex items-start gap-2">
                        <FileText size={13} className="text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Diagnostic : <span className="text-foreground font-medium">{c.diagnostic}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
