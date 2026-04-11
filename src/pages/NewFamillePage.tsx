import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, X, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { DataService } from "@/services/dataService";
import { PhotoUpload } from "@/components/PhotoUpload";

// ─── Constantes CNART ─────────────────────────────────────────────────────────

export const PRIME_ADULTE     = 475_000;   // FCFA
export const PRIME_ADULTE_AGE = 712_500;   // FCFA
export const ACCESSOIRES      = 100_000;   // FCFA (fixe)
export const TAUX_TAXE        = 0.106;     // 10,6 %

export type TypeAssure = "adulte" | "adulte_age";

export interface Beneficiaire {
  nom:  string;
  lien: string;
  type: TypeAssure;
}

// ─── Tableau des garanties (source : CNART Assurances) ────────────────────────

export const GARANTIES_CNART = [
  {
    categorie: "Honoraires médicaux",
    actes: "Consultations, visites, actes de pratique médicale courante, petite chirurgie",
    taux: "80 %",
    plafond: "Selon barème du Syndicat des Médecins Privés du Sénégal",
  },
  {
    categorie: "Pharmacie",
    actes: "Produits pharmaceutiques remboursés",
    taux: "80 %",
    plafond: "—",
  },
  {
    categorie: "Auxiliaires médicaux",
    actes: "Soins infirmiers, Kinésithérapie / Rééducation, Traitements psychiatriques",
    taux: "80 %",
    plafond: "Soumis à entente préalable",
  },
  {
    categorie: "Analyses biologiques",
    actes: "Analyses",
    taux: "80 %",
    plafond: "—",
  },
  {
    categorie: "Imagerie médicale",
    actes: "Radio, Scanner et IRM en externe",
    taux: "80 %",
    plafond: "—",
  },
  {
    categorie: "Soins dentaires",
    actes: "Soins et prothèses dentaires",
    taux: "80 %",
    plafond: "250 000 FCFA / bénéficiaire",
  },
  {
    categorie: "Optique",
    actes: "Verres & montures",
    taux: "80 %",
    plafond: "250 000 FCFA / bénéficiaire · Renouvelable tous les 2 ans",
  },
  {
    categorie: "Hospitalisation — Clinique",
    actes: "Frais de chambre en hospitalisation médicale et frais annexes",
    taux: "80 %",
    plafond: "45 000 FCFA / jour",
  },
  {
    categorie: "Hospitalisation — Hôpital",
    actes: "Hospitalisation médicale",
    taux: "80 %",
    plafond: "1ère catégorie de l'Hôpital Principal",
  },
  {
    categorie: "Orthophonie",
    actes: "Séances d'orthophonie",
    taux: "80 %",
    plafond: "100 000 FCFA / bénéficiaire / an",
  },
  {
    categorie: "Maternité — Simple",
    actes: "Frais d'accouchement simple normal",
    taux: "80 %",
    plafond: "400 000 FCFA / évènement · Délai d'attente : 9 mois",
  },
  {
    categorie: "Maternité — Gémellaire",
    actes: "Accouchement gémellaire normal",
    taux: "80 %",
    plafond: "500 000 FCFA / évènement",
  },
  {
    categorie: "Maternité — Chirurgical",
    actes: "Accouchement par voie chirurgicale ou avec complications nécessitant hospitalisation",
    taux: "80 %",
    plafond: "600 000 FCFA / évènement",
  },
  {
    categorie: "Transport terrestre",
    actes: "Transport par voie terrestre",
    taux: "80 %",
    plafond: "100 000 FCFA / évènement",
  },
];

// ─── Table réajustement S/P ───────────────────────────────────────────────────

export const REAJUSTEMENT_SP = [
  { rapport: "< 25 %",           ajustement: "−15 % (réduction)" },
  { rapport: "25 % – 50 %",      ajustement: "−10 % (réduction)" },
  { rapport: "50 % – 60 %",      ajustement: "−5 % (réduction)"  },
  { rapport: "60 % – 75 %",      ajustement: "Aucune modification" },
  { rapport: "75 % – 85 %",      ajustement: "+15 % (majoration)" },
  { rapport: "85 % – 100 %",     ajustement: "+30 % (majoration)" },
  { rapport: "100 % – 115 %",    ajustement: "+35 % (majoration)" },
  { rapport: "115 % – 120 %",    ajustement: "+50 % (majoration)" },
  { rapport: "120 % – 130 %",    ajustement: "+55 % (majoration)" },
  { rapport: "130 % – 140 %",    ajustement: "+85 % (majoration)" },
  { rapport: "> 140 %",          ajustement: "+95 % (majoration)" },
];

// ─── Calcul décompte ──────────────────────────────────────────────────────────

export function calcDecompte(beneficiaires: Beneficiaire[], typePrincipal: TypeAssure) {
  const tous = [{ type: typePrincipal }, ...beneficiaires];
  const nbAdulte    = tous.filter(p => p.type === "adulte").length;
  const nbAdulteAge = tous.filter(p => p.type === "adulte_age").length;
  const primeAdultes    = nbAdulte    * PRIME_ADULTE;
  const primeAdultesAge = nbAdulteAge * PRIME_ADULTE_AGE;
  const primeNette      = primeAdultes + primeAdultesAge;
  const taxes           = Math.round(primeNette * TAUX_TAXE);
  const total           = primeNette + ACCESSOIRES + taxes;
  return { nbAdulte, nbAdulteAge, primeAdultes, primeAdultesAge, primeNette, accessoires: ACCESSOIRES, taxes, total };
}

const DUREES = ["1", "2", "3"].map(v => ({ value: v, label: `${v} an${+v > 1 ? "s" : ""}` }));

// ─── Composant ────────────────────────────────────────────────────────────────

export default function NewFamillePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [showGaranties, setShowGaranties] = useState(false);
  const [showReajust, setShowReajust]     = useState(false);

  const [photo, setPhoto] = useState<string>("");
  const [formData, setFormData] = useState({
    principal:          "",
    telephone:          "",
    typePrincipal:      "adulte" as TypeAssure,
    dateDebut:          "",
    dureeGarantie:      "1",
    echeanceAuto:       true,
  });
  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([
    { nom: "", lien: "", type: "adulte" },
  ]);

  // Date fin calculée
  const dateFin = useMemo(() => {
    if (!formData.dateDebut) return "";
    const d = new Date(formData.dateDebut);
    d.setFullYear(d.getFullYear() + Number(formData.dureeGarantie));
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString("fr-FR");
  }, [formData.dateDebut, formData.dureeGarantie]);

  // Décompte calculé
  const decompte = useMemo(
    () => calcDecompte(beneficiaires, formData.typePrincipal),
    [beneficiaires, formData.typePrincipal]
  );

  const addBeneficiaire = () =>
    setBeneficiaires([...beneficiaires, { nom: "", lien: "", type: "adulte" }]);
  const removeBeneficiaire = (i: number) =>
    setBeneficiaires(beneficiaires.filter((_, idx) => idx !== i));
  const updateBeneficiaire = (i: number, field: keyof Beneficiaire, value: string) => {
    const updated = [...beneficiaires];
    updated[i] = { ...updated[i], [field]: value };
    setBeneficiaires(updated);
  };

  useEffect(() => {
    const idParam = Number(searchParams.get("id"));
    if (!idParam) return;
    setEditingId(idParam);
    DataService.getFamilleById(idParam)
      .then((famille) => {
        if (!famille) return;
        if (famille.photo) setPhoto(famille.photo);
        setFormData({
          principal:     famille.principal     || "",
          telephone:     famille.telephone     || "",
          typePrincipal: famille.typePrincipal || "adulte",
          dateDebut:     famille.dateDebut     || "",
          dureeGarantie: famille.dureeGarantie || "1",
          echeanceAuto:  famille.echeanceAuto  ?? true,
        });
        setBeneficiaires(
          (famille.beneficiaires || []).map((b: any) =>
            typeof b === "string"
              ? { nom: b.replace(/ \(.+\)$/, ""), lien: (b.match(/\((.+)\)$/) || [])[1] || "", type: "adulte" as TypeAssure }
              : b
          )
        );
      })
      .catch(() => toast.error("Erreur lors du chargement"));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      principal:     formData.principal,
      telephone:     formData.telephone,
      typePrincipal: formData.typePrincipal,
      photo:         photo || undefined,
      beneficiaires: beneficiaires.map(b => `${b.nom} (${b.lien})`),
      beneficiairesDetail: beneficiaires,
      dateDebut:     formData.dateDebut,
      dureeGarantie: formData.dureeGarantie,
      echeanceAuto:  formData.echeanceAuto,
      prime:         decompte.total.toString(),
      primeNette:    decompte.primeNette.toString(),
      taxes:         decompte.taxes.toString(),
    };
    try {
      if (editingId) {
        await DataService.updateFamille(editingId, payload);
        toast.success("Famille modifiée avec succès");
      } else {
        await DataService.createFamille(payload);
        toast.success("Famille créée avec succès");
      }
      navigate("/maladie-famille");
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'enregistrement");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-10">
        <Button variant="ghost" onClick={() => navigate("/maladie-famille")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-1">
            {editingId ? "Modifier la Famille" : "Nouvelle Famille"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Assurance Maladie Famille — CNART Assurances · Taux de remboursement : <strong>80 %</strong>
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Assuré principal ── */}
            <section className="space-y-4">
              <h3 className="font-semibold text-base border-b pb-2">Assuré principal</h3>
              <div className="flex items-start gap-4">
                <PhotoUpload
                  photo={photo}
                  onChange={setPhoto}
                  size="lg"
                  rounded="full"
                  label="Photo carte"
                />
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nom complet</Label>
                  <Input
                    required
                    value={formData.principal}
                    onChange={e => setFormData({ ...formData, principal: e.target.value })}
                    placeholder="Alioune Badara Diene"
                  />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    required
                    value={formData.telephone}
                    onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+221 77 123 45 67"
                  />
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <Select
                    value={formData.typePrincipal}
                    onValueChange={v => setFormData({ ...formData, typePrincipal: v as TypeAssure })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adulte">Adulte — 475 000 FCFA/an</SelectItem>
                      <SelectItem value="adulte_age">Adulte âgé — 712 500 FCFA/an</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                </div>
              </div>
            </section>

            {/* ── Bénéficiaires ── */}
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-base">
                  Bénéficiaires{" "}
                  <span className="text-sm text-muted-foreground font-normal">
                    ({beneficiaires.length} — total {beneficiaires.length + 1} personnes)
                  </span>
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addBeneficiaire}>
                  <Plus className="w-4 h-4 mr-2" /> Ajouter
                </Button>
              </div>

              {beneficiaires.map((ben, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-start">
                  <Input
                    required
                    placeholder="Nom du bénéficiaire"
                    value={ben.nom}
                    onChange={e => updateBeneficiaire(idx, "nom", e.target.value)}
                  />
                  <Input
                    required
                    placeholder="Lien (Épouse, Fils…)"
                    value={ben.lien}
                    onChange={e => updateBeneficiaire(idx, "lien", e.target.value)}
                  />
                  <Select
                    value={ben.type}
                    onValueChange={v => updateBeneficiaire(idx, "type", v)}
                  >
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adulte">Adulte</SelectItem>
                      <SelectItem value="adulte_age">Adulte âgé</SelectItem>
                    </SelectContent>
                  </Select>
                  {beneficiaires.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeBeneficiaire(idx)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </section>

            {/* ── Durée & Échéance ── */}
            <section className="space-y-4">
              <h3 className="font-semibold text-base border-b pb-2">Durée & Échéance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Durée de la garantie</Label>
                  <Select
                    value={formData.dureeGarantie}
                    onValueChange={v => setFormData({ ...formData, dureeGarantie: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DUREES.map(d => (
                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date de début</Label>
                  <Input
                    required
                    type="date"
                    value={formData.dateDebut}
                    onChange={e => setFormData({ ...formData, dateDebut: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Date d'échéance (calculée)</Label>
                  <Input
                    readOnly
                    value={dateFin}
                    className="bg-gray-50 text-muted-foreground cursor-not-allowed"
                    placeholder="—"
                  />
                </div>
              </div>

              {/* Toggle renouvellement auto */}
              <div className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, echeanceAuto: !formData.echeanceAuto })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.echeanceAuto ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.echeanceAuto ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    Renouvellement automatique à l'échéance
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formData.echeanceAuto
                      ? "Réajustement de prime effectué dans les 3 mois suivant l'échéance selon rapport S/P."
                      : "Un rappel sera envoyé avant l'expiration."}
                  </p>
                </div>
              </div>
            </section>

            {/* ── Décompte de la prime ── */}
            <section className="space-y-3">
              <h3 className="font-semibold text-base border-b pb-2">Décompte de la prime</h3>

              {/* Population */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-muted-foreground text-xs">Adulte(s)</p>
                  <p className="font-bold text-lg">{decompte.nbAdulte}</p>
                  <p className="text-xs text-blue-700">{PRIME_ADULTE.toLocaleString("fr-FR")} FCFA/pers</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-muted-foreground text-xs">Adulte(s) âgé(s)</p>
                  <p className="font-bold text-lg">{decompte.nbAdulteAge}</p>
                  <p className="text-xs text-purple-700">{PRIME_ADULTE_AGE.toLocaleString("fr-FR")} FCFA/pers</p>
                </div>
              </div>

              {/* Tableau décompte */}
              <div className="rounded-xl border overflow-hidden text-sm">
                <div className="bg-gray-50 px-4 py-2 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  Décompte annuel × {formData.dureeGarantie} an{+formData.dureeGarantie > 1 ? "s" : ""}
                </div>
                {[
                  {
                    label: `Prime nette adulte${decompte.nbAdulte > 1 ? "s" : ""} (${PRIME_ADULTE.toLocaleString()} × ${decompte.nbAdulte})`,
                    value: decompte.primeAdultes,
                    show: decompte.nbAdulte > 0,
                  },
                  {
                    label: `Prime nette adulte${decompte.nbAdulteAge > 1 ? "s" : ""} âgé${decompte.nbAdulteAge > 1 ? "s" : ""} (${PRIME_ADULTE_AGE.toLocaleString()} × ${decompte.nbAdulteAge})`,
                    value: decompte.primeAdultesAge,
                    show: decompte.nbAdulteAge > 0,
                  },
                  { label: "Prime nette totale", value: decompte.primeNette, show: true, bold: true },
                  { label: "Accessoires", value: decompte.accessoires, show: true },
                  { label: `Taxes (${(TAUX_TAXE * 100).toFixed(1)} %)`, value: decompte.taxes, show: true },
                ].filter(r => r.show).map((row, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center px-4 py-2.5 border-t ${row.bold ? "bg-blue-50 font-semibold" : ""}`}
                  >
                    <span className="text-sm">{row.label}</span>
                    <span className={`font-mono text-sm ${row.bold ? "text-blue-700" : ""}`}>
                      {(row.value * Number(formData.dureeGarantie)).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-3 border-t bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <span className="font-bold text-base">TOTAL À PAYER</span>
                  <span className="font-bold text-xl font-mono">
                    {(decompte.total * Number(formData.dureeGarantie)).toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>
            </section>

            {/* ── Tableau des garanties (collapsible) ── */}
            <section>
              <button
                type="button"
                onClick={() => setShowGaranties(!showGaranties)}
                className="w-full flex items-center justify-between p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-sm">Tableau des garanties — Prise en charge au Sénégal</span>
                {showGaranties ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showGaranties && (
                <div className="mt-2 overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-700 text-white">
                        <th className="text-left p-3 font-semibold">Nature des actes</th>
                        <th className="p-3 text-center font-semibold w-24">Taux</th>
                        <th className="text-left p-3 font-semibold">Plafond de remboursement</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GARANTIES_CNART.map((row, i) => (
                        <tr key={i} className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                          <td className="p-3">
                            <p className="font-semibold text-xs text-blue-700">{row.categorie}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{row.actes}</p>
                          </td>
                          <td className="p-3 text-center font-bold text-green-700">{row.taux}</td>
                          <td className="p-3 text-xs text-muted-foreground">{row.plafond}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ── Réajustement S/P (collapsible) ── */}
            <section>
              <button
                type="button"
                onClick={() => setShowReajust(!showReajust)}
                className="w-full flex items-center justify-between p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-sm">Réajustement de la prime — Rapport S/P</span>
                {showReajust ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showReajust && (
                <div className="mt-2 overflow-x-auto rounded-lg border">
                  <div className="p-3 bg-amber-50 border-b text-xs text-amber-800">
                    Dans les 3 mois suivant l'échéance, un avenant de réajustement est établi en fonction du rapport Sinistres / Primes (S/P).
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-3 font-semibold">Rapport S/P</th>
                        <th className="text-left p-3 font-semibold">Ajustement de prime</th>
                      </tr>
                    </thead>
                    <tbody>
                      {REAJUSTEMENT_SP.map((row, i) => (
                        <tr key={i} className={`border-t ${
                          row.ajustement.includes("réduction") ? "bg-green-50"
                          : row.ajustement === "Aucune modification" ? "bg-gray-50"
                          : "bg-red-50"
                        }`}>
                          <td className="p-3 font-mono text-xs">{row.rapport}</td>
                          <td className={`p-3 text-xs font-semibold ${
                            row.ajustement.includes("réduction") ? "text-green-700"
                            : row.ajustement === "Aucune modification" ? "text-gray-600"
                            : "text-red-700"
                          }`}>{row.ajustement}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <Button type="submit" className="w-full py-6 text-base">
              {editingId ? "Modifier la famille" : "Créer la famille"}
            </Button>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
