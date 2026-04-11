import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Pill, FileText, Loader2, AlertCircle, Download, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { DataService } from "@/services/dataService";

export default function PrescriptionsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    DataService.getPrescriptions()
      .then((list) => setPrescriptions(list ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const assureNom = (p: any) => {
    const assure = p.consultation?.assure;
    return assure ? `${assure.nom} ${assure.prenom}` : "";
  };

  const filtered = prescriptions.filter((p) => {
    const q = search.toLowerCase();
    return (
      assureNom(p).toLowerCase().includes(q) ||
      (p.medicament || "").toLowerCase().includes(q) ||
      (p.consultation?.prestataire?.nom || "").toLowerCase().includes(q)
    );
  });

  const downloadPrescription = (p: any) => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 800, 900);
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(0, 0, 800, 110);
    ctx.fillStyle = "white";
    ctx.font = "bold 28px Arial";
    ctx.fillText("ORDONNANCE MÉDICALE", 50, 50);
    ctx.font = "16px Arial";
    ctx.fillText("Assurance Santé Connect", 50, 85);
    ctx.fillStyle = "black";
    ctx.font = "bold 15px Arial";
    ctx.fillText(`Patient : ${assureNom(p) || "—"}`, 50, 150);
    ctx.fillText(`Médecin : ${p.consultation?.prestataire?.nom || "—"}`, 50, 180);
    ctx.fillText(`Date : ${p.createdAt ? new Date(p.createdAt).toLocaleDateString("fr-FR") : "—"}`, 50, 210);
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(50, 235); ctx.lineTo(750, 235); ctx.stroke();
    ctx.font = "bold 17px Arial";
    ctx.fillText("MÉDICAMENT PRESCRIT :", 50, 270);
    ctx.font = "bold 15px Arial";
    ctx.fillText(p.medicament || "—", 70, 305);
    ctx.font = "14px Arial";
    ctx.fillText(`Dosage : ${p.dosage || "—"}`, 70, 335);
    ctx.fillText(`Durée : ${p.duree || "—"}`, 70, 360);
    if (p.instructions) {
      ctx.font = "bold 15px Arial";
      ctx.fillText("Instructions :", 50, 410);
      ctx.font = "14px Arial";
      ctx.fillText(p.instructions, 70, 440);
    }
    ctx.strokeStyle = "#2563eb"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(450, 750); ctx.lineTo(700, 750); ctx.stroke();
    ctx.font = "12px Arial"; ctx.fillStyle = "#555";
    ctx.fillText("Signature du prescripteur", 490, 770);
    ctx.fillStyle = "#888"; ctx.font = "10px Arial";
    ctx.fillText("Ordonnance valable 30 jours", 50, 870);
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `ordonnance-${p.id}.png`; a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <AppLayout title="Gestion des Ordonnances">
      <div className="space-y-4 sm:space-y-5">

        {/* ── Compteurs ──────────────────────────────────────────────── */}
        {!loading && !error && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: "Total",        value: prescriptions.length, bg: "bg-green-50",  border: "border-green-200", num: "text-green-900", sub: "text-green-700",  icon: <Pill size={15} />,      iconBg: "bg-green-600" },
              { label: "Consultations",value: new Set(prescriptions.map(p => p.consultation?.id).filter(Boolean)).size, bg: "bg-blue-50", border: "border-blue-200", num: "text-blue-900", sub: "text-blue-700", icon: <FileText size={15} />, iconBg: "bg-blue-600" },
              { label: "Patients",     value: new Set(prescriptions.map(p => p.consultation?.assure?.id).filter(Boolean)).size, bg: "bg-purple-50", border: "border-purple-200", num: "text-purple-900", sub: "text-purple-700", icon: <FileText size={15} />, iconBg: "bg-purple-600" },
            ].map(c => (
              <div key={c.label} className={`${c.bg} border ${c.border} rounded-xl p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${c.iconBg} rounded-lg flex items-center justify-center text-white shrink-0`}>
                  {c.icon}
                </div>
                <div className="min-w-0">
                  <p className={`text-lg sm:text-2xl font-bold ${c.num} leading-none`}>{c.value}</p>
                  <p className={`text-xs sm:text-sm ${c.sub} truncate mt-0.5`}>{c.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Barre d'actions ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-1 sm:max-w-md">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border border-input bg-card text-sm">
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
            onClick={() => navigate("/prescriptions/new")}
          >
            <Plus size={15} className="mr-1.5" />
            <span className="hidden sm:inline">Nouvelle ordonnance</span>
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
            <p className="font-medium text-sm">Impossible de charger les ordonnances</p>
            <p className="text-xs text-muted-foreground">Vérifiez que le backend est démarré</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-4">
            <Pill size={40} className="text-muted-foreground opacity-30" />
            <p className="font-semibold">{search ? "Aucun résultat" : "Aucune ordonnance enregistrée"}</p>
            {!search && (
              <p className="text-sm text-muted-foreground max-w-sm">
                Les ordonnances sont créées à partir des consultations médicales.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-4 sm:p-5 border border-border hover:shadow-md transition-shadow"
              >
                {/* En-tête */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white shrink-0">
                    <Pill size={17} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-sm sm:text-base">{assureNom(p) || "Patient inconnu"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.createdAt ? `Prescrit le ${new Date(p.createdAt).toLocaleDateString("fr-FR")}` : "—"}
                    </p>
                    {p.consultation?.prestataire?.nom && (
                      <p className="text-xs text-muted-foreground truncate">Dr. {p.consultation.prestataire.nom}</p>
                    )}
                  </div>
                </div>

                {/* Médicament */}
                <div className="bg-muted/40 rounded-lg p-2.5 sm:p-3 mb-3">
                  <p className="font-semibold text-sm truncate">{p.medicament || "—"}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                    <span>Dosage : <span className="text-foreground font-medium">{p.dosage || "—"}</span></span>
                    <span>Durée : <span className="text-foreground font-medium">{p.duree || "—"}</span></span>
                  </div>
                </div>

                {p.instructions && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    <span className="font-medium text-foreground">Instructions :</span> {p.instructions}
                  </p>
                )}

                {/* Actions */}
                <div className="border-t pt-3 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadPrescription(p)} className="text-xs h-8">
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Télécharger
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/prescriptions/${p.id}`)} className="text-xs h-8">
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Détails
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
