import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Download, QrCode, CreditCard, Loader2, ServerCrash, Users } from "@/components/ui/Icons";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { DataService } from "@/services/dataService";
import { useAuth } from "@/context/AuthContext";

// ─── QR helper ───────────────────────────────────────────────────────────────
const qrUrl = (data: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=1B5299&margin=6`;

// ─── Chip SVG (imitation puce bancaire) ──────────────────────────────────────
const ChipSVG = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 50 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="48" height="36" rx="5" fill="#D4A017" stroke="#B8860B" strokeWidth="1.5"/>
    <rect x="16" y="1" width="18" height="36" fill="#C49A10"/>
    <rect x="1" y="12" width="48" height="14" fill="#C49A10"/>
    <rect x="16" y="12" width="18" height="14" fill="#B8860B"/>
    <rect x="18" y="14" width="14" height="10" rx="1" fill="#D4A017" stroke="#B8860B" strokeWidth="0.8"/>
    <line x1="1" y1="12" x2="16" y2="12" stroke="#B8860B" strokeWidth="0.8"/>
    <line x1="34" y1="12" x2="49" y2="12" stroke="#B8860B" strokeWidth="0.8"/>
    <line x1="1" y1="26" x2="16" y2="26" stroke="#B8860B" strokeWidth="0.8"/>
    <line x1="34" y1="26" x2="49" y2="26" stroke="#B8860B" strokeWidth="0.8"/>
  </svg>
);

// ─── Carte visuelle ───────────────────────────────────────────────────────────
function InsuranceCard({ assure }: { assure: any }) {
  const isFamille = (assure.type ?? "").toUpperCase() === "FAMILLE";
  const isGroupe  = (assure.type ?? "").toUpperCase() === "GROUPE";
  const beneficiaires: string[] = assure.beneficiaires ?? [];

  const dateValidite = assure.dateFin
    ? new Date(assure.dateFin).toLocaleDateString("fr-FR")
    : "31/12/2026";

  const dateNaissance = assure.dateNaissance
    ? new Date(assure.dateNaissance).toLocaleDateString("fr-FR")
    : assure.dateNaissance ?? "—";

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden select-none"
      style={{ aspectRatio: "856/540", boxShadow: "0 20px 60px rgba(27,82,153,0.35)" }}
    >
      {/* ── Fond blanc ─────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-white" />

      {/* ── Filigrane "PSA" ────────────────────────────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: 0.04 }}
      >
        <span className="text-[200px] font-black text-brand leading-none select-none">PSA</span>
      </div>

      {/* ── Bande supérieure bleue ─────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-[28%] bg-brand flex items-center px-[4%] gap-[3%]">
        {/* Logo */}
        <img
          src="/logo1.png"
          alt="PSA"
          className="h-[65%] object-contain drop-shadow"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {/* Textes */}
        <div className="flex flex-col text-white leading-tight min-w-0">
          <span className="font-black tracking-wide" style={{ fontSize: "clamp(7px,1.8vw,14px)" }}>
            PAPY SERVICES ASSURANCES
          </span>
          <span className="font-semibold opacity-90" style={{ fontSize: "clamp(5px,1.2vw,10px)" }}>
            CARTE D'ASSURANCE SANTÉ
          </span>
        </div>
        {/* Type badge à droite */}
        <div className="ml-auto bg-white/20 rounded px-2 py-0.5 shrink-0">
          <span className="text-white font-bold" style={{ fontSize: "clamp(5px,1.1vw,9px)" }}>
            {isGroupe ? "GROUPE" : isFamille ? "FAMILLE" : "INDIVIDUEL"}
          </span>
        </div>
      </div>

      {/* ── Bande numéro de carte (or/jaune) ──────────────────────── */}
      <div
        className="absolute left-0 right-0 flex items-center px-[4%]"
        style={{ top: "28%", height: "12%", background: "linear-gradient(90deg, #D4A017 0%, #F0C430 50%, #D4A017 100%)" }}
      >
        <span
          className="font-black tracking-[0.18em] text-white drop-shadow"
          style={{ fontSize: "clamp(8px,1.9vw,15px)", letterSpacing: "0.12em" }}
        >
          {assure.numero ?? "PSA-0000-0000-0000"}
        </span>
      </div>

      {/* ── Corps de la carte ──────────────────────────────────────── */}
      <div
        className="absolute left-0 right-0 bottom-0 flex"
        style={{ top: "40%", padding: "2.5% 4%" }}
      >
        {/* ── Colonne gauche : puce + infos ─────────────────────── */}
        <div className="flex-1 flex flex-col justify-between min-w-0 pr-[3%]">
          {/* Puce + nom */}
          <div className="flex items-center gap-[3%]">
            <ChipSVG className="shrink-0" style={{ height: "clamp(20px,5vw,38px)", width: "auto" } as any} />
            <div className="min-w-0">
              <div className="text-gray-400 font-medium" style={{ fontSize: "clamp(4px,0.9vw,7px)" }}>NOM / NAME</div>
              <div className="font-black text-gray-900 truncate uppercase" style={{ fontSize: "clamp(7px,1.6vw,13px)" }}>
                {assure.nom ?? "—"}
              </div>
              <div className="font-semibold text-gray-700 truncate" style={{ fontSize: "clamp(6px,1.3vw,11px)" }}>
                {assure.prenom ?? ""}
              </div>
            </div>
          </div>

          {/* Grille de champs */}
          <div className="grid grid-cols-2 gap-x-[4%] gap-y-[1%] mt-[2%]">
            {!isGroupe && (
              <>
                <Field label="Sexe" value={assure.sexe ?? "—"} />
                <Field label="Né(e) le" value={dateNaissance} />
                <Field label="Tél" value={assure.telephone ?? "—"} />
                <Field label="Garantie" value={assure.garantie ?? "Standard"} />
              </>
            )}
            {isGroupe && (
              <>
                <Field label="Entreprise" value={assure.nom ?? "—"} />
                <Field label="Secteur" value={assure.secteur ?? "—"} />
                <Field label="Employés" value={String(assure.employes ?? "—")} />
                <Field label="Assurés" value={String(assure.assures ?? beneficiaires.length || "—")} />
              </>
            )}
            <Field label="Statut" value={assure.statut ?? "—"} highlight />
            <Field label="Valide jusqu'au" value={dateValidite} />
          </div>

          {/* Bénéficiaires (famille) */}
          {isFamille && beneficiaires.length > 0 && (
            <div className="mt-[2%] border-t border-gray-100 pt-[1.5%]">
              <div className="text-gray-400 font-medium mb-[1%]" style={{ fontSize: "clamp(4px,0.8vw,6px)" }}>
                BÉNÉFICIAIRES
              </div>
              <div className="flex flex-wrap gap-[1%]">
                {beneficiaires.slice(0, 4).map((b, i) => (
                  <span
                    key={i}
                    className="bg-brand/10 text-brand font-semibold rounded px-[2%] py-[0.5%]"
                    style={{ fontSize: "clamp(4px,0.85vw,7px)" }}
                  >
                    {b}
                  </span>
                ))}
                {beneficiaires.length > 4 && (
                  <span className="text-gray-400" style={{ fontSize: "clamp(4px,0.8vw,6px)" }}>
                    +{beneficiaires.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Colonne droite : photo + QR ───────────────────────── */}
        <div className="flex flex-col items-center gap-[4%] shrink-0" style={{ width: "22%" }}>
          {/* Photo */}
          <div
            className="w-full rounded-lg overflow-hidden border-2 border-brand/30 bg-gray-100 flex items-center justify-center"
            style={{ aspectRatio: "3/4" }}
          >
            {assure.photo ? (
              <img src={assure.photo} alt="photo" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-gray-300">
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "40%" }}>
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            )}
          </div>

          {/* QR code */}
          <div className="w-full bg-white border border-gray-200 rounded p-[4%]">
            <img
              src={qrUrl(assure.numero ?? "PSA")}
              alt="QR"
              className="w-full"
              crossOrigin="anonymous"
            />
          </div>
        </div>
      </div>

      {/* ── Filet bas + mention ────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-[4%] bg-brand/5 border-t border-brand/10"
        style={{ height: "6%" }}
      >
        <span className="text-gray-400" style={{ fontSize: "clamp(4px,0.7vw,6px)" }}>
          Délivrée le {new Date().toLocaleDateString("fr-FR")}
        </span>
        <span className="text-brand font-semibold" style={{ fontSize: "clamp(4px,0.7vw,6px)" }}>
          www.papyservicesassurances.sn
        </span>
        <span className="text-gray-400 italic" style={{ fontSize: "clamp(4px,0.7vw,6px)" }}>
          Le Directeur Général
        </span>
      </div>
    </div>
  );
}

function Field({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-gray-400 font-medium uppercase" style={{ fontSize: "clamp(3px,0.7vw,5.5px)" }}>
        {label}
      </div>
      <div
        className={`font-semibold truncate ${highlight ? "text-green-600" : "text-gray-800"}`}
        style={{ fontSize: "clamp(5px,1vw,8px)" }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Canvas download ──────────────────────────────────────────────────────────
async function downloadCard(assure: any) {
  const W = 1000, H = 630;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const BRAND = "#1B5299";
  const GOLD  = "#D4A017";
  const loadImg = (src: string): Promise<HTMLImageElement | null> =>
    new Promise(resolve => {
      const img = new Image(); img.crossOrigin = "anonymous";
      img.onload  = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

  // Fond blanc arrondi
  ctx.fillStyle = "white";
  ctx.beginPath(); ctx.roundRect(0, 0, W, H, 28); ctx.fill();

  // Filigrane PSA
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = BRAND;
  ctx.font = "bold 260px Arial";
  ctx.textAlign = "center";
  ctx.fillText("PSA", W / 2, H / 2 + 90);
  ctx.restore();

  // Bande supérieure bleue
  ctx.fillStyle = BRAND;
  ctx.beginPath(); ctx.roundRect(0, 0, W, 176, [28, 28, 0, 0]); ctx.fill();
  ctx.fillRect(0, 148, W, 30);

  // Logo
  const logo = await loadImg("/logo1.png");
  if (logo) ctx.drawImage(logo, 28, 12, 115, 115);

  // Titre
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.font = "bold 28px Arial";
  ctx.fillText("PAPY SERVICES ASSURANCES", 155, 65);
  ctx.font = "18px Arial";
  ctx.globalAlpha = 0.9;
  ctx.fillText("CARTE D'ASSURANCE SANTÉ", 155, 92);
  ctx.globalAlpha = 1;

  // Badge type
  const typeLabel = (assure.type ?? "").toUpperCase() === "GROUPE" ? "GROUPE"
    : (assure.type ?? "").toUpperCase() === "FAMILLE" ? "FAMILLE" : "INDIVIDUEL";
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath(); ctx.roundRect(W - 130, 24, 110, 30, 6); ctx.fill();
  ctx.fillStyle = "white"; ctx.font = "bold 14px Arial"; ctx.textAlign = "center";
  ctx.fillText(typeLabel, W - 75, 43);
  ctx.textAlign = "left";

  // Bande or numéro
  const grad = ctx.createLinearGradient(0, 176, W, 176);
  grad.addColorStop(0, "#C49A10"); grad.addColorStop(0.5, "#F0C430"); grad.addColorStop(1, "#C49A10");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 176, W, 70);
  ctx.fillStyle = "white";
  ctx.font = "bold 30px monospace";
  ctx.fillText(assure.numero ?? "PSA-0000-0000-0000", 38, 220);

  // ── Puce (dessin simple) ──
  ctx.fillStyle = GOLD;
  ctx.beginPath(); ctx.roundRect(38, 272, 62, 46, 6); ctx.fill();
  ctx.fillStyle = "#C49A10";
  ctx.fillRect(58, 272, 22, 46);
  ctx.fillRect(38, 288, 62, 14);
  ctx.fillStyle = GOLD;
  ctx.beginPath(); ctx.roundRect(60, 290, 18, 10, 2); ctx.fill();

  // ── Photo ──
  const photoX = W - 185, photoY = 265, photoW = 150, photoH = 200;
  ctx.fillStyle = "#E5E7EB";
  ctx.beginPath(); ctx.roundRect(photoX, photoY, photoW, photoH, 8); ctx.fill();
  if (assure.photo) {
    const photoImg = await loadImg(assure.photo);
    if (photoImg) {
      ctx.save();
      ctx.beginPath(); ctx.roundRect(photoX, photoY, photoW, photoH, 8); ctx.clip();
      ctx.drawImage(photoImg, photoX, photoY, photoW, photoH);
      ctx.restore();
    }
  }
  ctx.strokeStyle = `${BRAND}55`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(photoX, photoY, photoW, photoH, 8); ctx.stroke();

  // ── Infos texte ──
  const col1X = 38, col2X = 340;
  const isFamille = (assure.type ?? "").toUpperCase() === "FAMILLE";
  const isGroupe  = (assure.type ?? "").toUpperCase() === "GROUPE";
  const rows = isGroupe ? [
    ["Entreprise", assure.nom ?? "—"],
    ["Secteur",    assure.secteur ?? "—"],
    ["Employés",   String(assure.employes ?? "—")],
    ["Assurés",    String(assure.assures ?? (assure.beneficiaires?.length ?? "—"))],
  ] : [
    ["Nom",        assure.nom ?? "—"],
    ["Prénoms",    assure.prenom ?? "—"],
    ["Sexe",       assure.sexe ?? "—"],
    ["Né(e) le",   assure.dateNaissance ? new Date(assure.dateNaissance).toLocaleDateString("fr-FR") : "—"],
  ];

  const rows2 = [
    ["Téléphone",  assure.telephone ?? "—"],
    ["Garantie",   assure.garantie ?? "Standard"],
    ["Statut",     assure.statut ?? "—"],
    ["Valide jusqu'au", assure.dateFin ? new Date(assure.dateFin).toLocaleDateString("fr-FR") : "31/12/2026"],
  ];

  let y = 285;
  rows.slice(0, 4).forEach(([label, value]) => {
    ctx.fillStyle = "#9CA3AF"; ctx.font = "11px Arial";
    ctx.fillText(label.toUpperCase(), col1X + 70, y);
    ctx.fillStyle = "#111827"; ctx.font = "bold 15px Arial";
    ctx.fillText(String(value).substring(0, 22), col1X + 70, y + 18);
    y += 42;
  });

  y = 285;
  rows2.forEach(([label, value]) => {
    ctx.fillStyle = "#9CA3AF"; ctx.font = "11px Arial";
    ctx.fillText(label.toUpperCase(), col2X, y);
    ctx.fillStyle = label === "Statut" ? "#059669" : "#111827";
    ctx.font = "bold 15px Arial";
    ctx.fillText(String(value).substring(0, 22), col2X, y + 18);
    y += 42;
  });

  // Bénéficiaires famille
  if (isFamille && assure.beneficiaires?.length > 0) {
    ctx.fillStyle = "#9CA3AF"; ctx.font = "11px Arial"; ctx.textAlign = "left";
    ctx.fillText("BÉNÉFICIAIRES", col1X + 70, 475);
    const bens = assure.beneficiaires.slice(0, 5).join("  ·  ");
    ctx.fillStyle = BRAND; ctx.font = "bold 13px Arial";
    ctx.fillText(bens.substring(0, 50), col1X + 70, 492);
  }

  // QR code
  const qr = await loadImg(qrUrl(assure.numero ?? "PSA"));
  if (qr) {
    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.roundRect(photoX, photoY + photoH + 14, photoW, photoW, 8); ctx.fill();
    ctx.drawImage(qr, photoX + 4, photoY + photoH + 18, photoW - 8, photoW - 8);
  }

  // Bas de carte
  ctx.fillStyle = `${BRAND}0D`;
  ctx.fillRect(0, H - 42, W, 42);
  ctx.strokeStyle = `${BRAND}22`; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, H - 42); ctx.lineTo(W, H - 42); ctx.stroke();

  ctx.fillStyle = "#9CA3AF"; ctx.font = "11px Arial"; ctx.textAlign = "left";
  ctx.fillText(`Délivrée le ${new Date().toLocaleDateString("fr-FR")}`, 28, H - 16);
  ctx.textAlign = "center";
  ctx.fillStyle = BRAND; ctx.font = "bold 11px Arial";
  ctx.fillText("www.papyservicesassurances.sn", W / 2, H - 16);
  ctx.textAlign = "right";
  ctx.fillStyle = "#9CA3AF"; ctx.font = "italic 11px Arial";
  ctx.fillText("Le Directeur Général", W - 28, H - 16);

  // Clip arrondi final
  ctx.globalCompositeOperation = "destination-in";
  ctx.beginPath(); ctx.roundRect(0, 0, W, H, 28); ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `carte-psa-${assure.numero ?? "assurance"}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function CartesPage() {
  const { user } = useAuth();
  const isClient = user?.role === "client";

  const [search, setSearch] = useState("");
  const [assures, setAssures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    DataService.getAssures()
      .then(list => {
        const all = list ?? [];
        setAssures(isClient ? all.filter((a: any) => a.email === user?.email) : all);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [isClient, user?.email]);

  const filtered = assures.filter(a =>
    (a.nom ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (a.prenom ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (a.numero ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const pageTitle = isClient ? "Ma Carte d'assurance" : "Cartes d'assurance";

  if (loading) return (
    <AppLayout title={pageTitle}>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <span className="ml-3 text-sm text-muted-foreground">Chargement des cartes…</span>
      </div>
    </AppLayout>
  );

  if (error) return (
    <AppLayout title={pageTitle}>
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
        <ServerCrash className="w-10 h-10 text-muted-foreground opacity-40" />
        <p className="font-semibold">Impossible de joindre le serveur</p>
        <p className="text-sm text-muted-foreground">Service temporairement indisponible</p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title={pageTitle}>
      <div className="space-y-5">

        {/* ── Barre de recherche ─────────────────────────────────────── */}
        {!isClient && (
          <div className="flex items-center gap-2 w-full max-w-sm">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border border-input bg-card text-sm">
              <Search size={15} className="text-muted-foreground shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un assuré…"
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-0"
              />
            </div>
          </div>
        )}

        {/* ── Vide ───────────────────────────────────────────────────── */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
            <CreditCard size={40} className="text-muted-foreground opacity-30" />
            <p className="font-semibold">
              {search ? "Aucun assuré trouvé" : isClient ? "Aucune carte pour votre compte" : "Aucun assuré enregistré"}
            </p>
            {!search && isClient && (
              <p className="text-sm text-muted-foreground max-w-xs">
                Contactez l'administrateur si votre dossier est introuvable.
              </p>
            )}
          </div>
        )}

        {/* ── Grille de cartes ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filtered.map((assure, i) => (
            <motion.div
              key={assure.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="space-y-3"
            >
              {/* Carte visuelle */}
              <InsuranceCard assure={assure} />

              {/* Actions */}
              <div className="flex items-center gap-2 px-1">
                {/* Info bénéficiaires */}
                {(assure.beneficiaires?.length > 0) && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users size={13} />
                    <span>{assure.beneficiaires.length} bénéficiaire{assure.beneficiaires.length > 1 ? "s" : ""}</span>
                  </div>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button
                    size="sm"
                    onClick={() => downloadCard(assure)}
                    className="h-8 text-xs gap-1.5"
                  >
                    <Download size={13} />
                    Télécharger
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Voir QR code"
                    onClick={() => window.open(qrUrl(assure.numero ?? "PSA"), "_blank")}
                  >
                    <QrCode size={13} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}
