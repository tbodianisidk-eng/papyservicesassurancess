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
import { ArrowLeft, Plus, X, RefreshCw, ChevronDown, ChevronUp, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { DataService } from "@/services/dataService";
import { PhotoUpload } from "@/components/PhotoUpload";
import {
  GARANTIES_CNART, REAJUSTEMENT_SP,
  PRIME_ADULTE, PRIME_ADULTE_AGE,
  ACCESSOIRES, TAUX_TAXE,
  type TypeAssure,
} from "./NewFamillePage";

// ─── Types Groupe ─────────────────────────────────────────────────────────────

export interface MembreFamille {
  nom:  string;
  lien: string;
  type: TypeAssure;
}

export interface Employe {
  id:         string;
  nom:        string;
  poste:      string;
  matricule:  string;
  type:       TypeAssure;
  photo?:     string;       // base64
  famille:    MembreFamille[];
}

// ─── Calcul décompte groupe ───────────────────────────────────────────────────

export function calcDecompteGroupe(employes: Employe[]) {
  let nbAdulte = 0;
  let nbAdulteAge = 0;
  for (const emp of employes) {
    if (emp.type === "adulte") nbAdulte++; else nbAdulteAge++;
    for (const m of emp.famille) {
      if (m.type === "adulte") nbAdulte++; else nbAdulteAge++;
    }
  }
  const primeAdultes    = nbAdulte    * PRIME_ADULTE;
  const primeAdultesAge = nbAdulteAge * PRIME_ADULTE_AGE;
  const primeNette      = primeAdultes + primeAdultesAge;
  const taxes           = Math.round(primeNette * TAUX_TAXE);
  const total           = primeNette + ACCESSOIRES + taxes;
  return { nbAdulte, nbAdulteAge, primeAdultes, primeAdultesAge, primeNette, accessoires: ACCESSOIRES, taxes, total };
}

const DUREES = ["1", "2", "3"].map(v => ({ value: v, label: `${v} an${+v > 1 ? "s" : ""}` }));

function newEmploye(): Employe {
  return { id: crypto.randomUUID(), nom: "", poste: "", matricule: "", type: "adulte", famille: [] };
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function NewGroupePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [editingId, setEditingId]         = useState<number | null>(null);
  const [showGaranties, setShowGaranties] = useState(false);
  const [showReajust, setShowReajust]     = useState(false);
  const [expandedEmp, setExpandedEmp]     = useState<string | null>(null);

  const [formData, setFormData] = useState({
    entreprise:    "",
    secteur:       "",
    dateDebut:     "",
    dureeGarantie: "1",
    echeanceAuto:  true,
  });
  const [employes, setEmployes] = useState<Employe[]>([newEmploye()]);

  // Date fin calculée
  const dateFin = useMemo(() => {
    if (!formData.dateDebut) return "";
    const d = new Date(formData.dateDebut);
    d.setFullYear(d.getFullYear() + Number(formData.dureeGarantie));
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString("fr-FR");
  }, [formData.dateDebut, formData.dureeGarantie]);

  const decompte = useMemo(() => calcDecompteGroupe(employes), [employes]);

  // ── CRUD employés ──
  const addEmploye = () => setEmployes(prev => [...prev, newEmploye()]);
  const removeEmploye = (id: string) => setEmployes(prev => prev.filter(e => e.id !== id));
  const updateEmploye = (id: string, field: keyof Employe, value: any) =>
    setEmployes(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));

  // ── CRUD famille d'un employé ──
  const addMembre = (empId: string) =>
    setEmployes(prev => prev.map(e =>
      e.id === empId ? { ...e, famille: [...e.famille, { nom: "", lien: "", type: "adulte" as TypeAssure }] } : e
    ));
  const removeMembre = (empId: string, idx: number) =>
    setEmployes(prev => prev.map(e =>
      e.id === empId ? { ...e, famille: e.famille.filter((_, i) => i !== idx) } : e
    ));
  const updateMembre = (empId: string, idx: number, field: keyof MembreFamille, value: string) =>
    setEmployes(prev => prev.map(e =>
      e.id === empId
        ? { ...e, famille: e.famille.map((m, i) => i === idx ? { ...m, [field]: value } : m) }
        : e
    ));

  useEffect(() => {
    const idParam = Number(searchParams.get("id"));
    if (!idParam) return;
    setEditingId(idParam);
    DataService.getGroupeById(idParam)
      .then((groupe) => {
        if (!groupe) return;
        setFormData({
          entreprise:    groupe.entreprise    || "",
          secteur:       groupe.secteur       || "",
          dateDebut:     groupe.debut         || "",
          dureeGarantie: groupe.dureeGarantie || "1",
          echeanceAuto:  groupe.echeanceAuto  ?? true,
        });
        if (groupe.employesDetail?.length) setEmployes(groupe.employesDetail);
      })
      .catch(() => toast.error("Erreur lors du chargement"));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalAssures = employes.reduce((s, emp) => s + 1 + emp.famille.length, 0);
    const payload = {
      entreprise:     formData.entreprise,
      secteur:        formData.secteur,
      employes:       employes.length,
      assures:        totalAssures,
      debut:          formData.dateDebut,
      dureeGarantie:  formData.dureeGarantie,
      echeanceAuto:   formData.echeanceAuto,
      prime:          (decompte.total * Number(formData.dureeGarantie)).toString(),
      primeNette:     (decompte.primeNette * Number(formData.dureeGarantie)).toString(),
      taxes:          (decompte.taxes * Number(formData.dureeGarantie)).toString(),
      employesDetail: employes,
    };
    try {
      if (editingId) {
        await DataService.updateGroupe(editingId, payload);
        toast.success("Groupe modifié avec succès");
      } else {
        await DataService.createGroupe(payload);
        toast.success("Groupe créé avec succès");
      }
      navigate("/maladie-groupe");
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'enregistrement");
    }
  };

  const duree = Number(formData.dureeGarantie);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        <Button variant="ghost" onClick={() => navigate("/maladie-groupe")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-1">
            {editingId ? "Modifier le Groupe" : "Nouveau Groupe"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Assurance Maladie Groupe — CNART Assurances · Taux de remboursement : <strong>80 %</strong>
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Entreprise ── */}
            <section className="space-y-4">
              <h3 className="font-semibold text-base border-b pb-2">Entreprise</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nom de l'entreprise</Label>
                  <Input
                    required
                    value={formData.entreprise}
                    onChange={e => setFormData({ ...formData, entreprise: e.target.value })}
                    placeholder="Sonatel SA"
                  />
                </div>
                <div>
                  <Label>Secteur d'activité</Label>
                  <Input
                    required
                    value={formData.secteur}
                    onChange={e => setFormData({ ...formData, secteur: e.target.value })}
                    placeholder="Télécommunications, Finance…"
                  />
                </div>
              </div>
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
                      ? "Réajustement S/P dans les 3 mois suivant l'échéance."
                      : "Un rappel sera envoyé avant l'expiration."}
                  </p>
                </div>
              </div>
            </section>

            {/* ── Liste des employés ── */}
            <section className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-base">
                  Employés & familles{" "}
                  <span className="text-sm text-muted-foreground font-normal">
                    ({employes.length} employé{employes.length > 1 ? "s" : ""} ·{" "}
                    {employes.reduce((s, e) => s + 1 + e.famille.length, 0)} assuré{employes.reduce((s, e) => s + 1 + e.famille.length, 0) > 1 ? "s" : ""})
                  </span>
                </h3>
                <Button type="button" variant="outline" size="sm" onClick={addEmploye}>
                  <Plus className="w-4 h-4 mr-2" /> Ajouter employé
                </Button>
              </div>

              {employes.map((emp, empIdx) => {
                const isOpen = expandedEmp === emp.id;
                return (
                  <Card key={emp.id} className="border-2 border-blue-100 overflow-hidden">
                    {/* En-tête employé */}
                    <div className="p-4 bg-blue-50/60 flex items-center gap-3">
                      {/* Photo */}
                      <PhotoUpload
                        photo={emp.photo}
                        onChange={b64 => updateEmploye(emp.id, "photo", b64)}
                        size="md"
                        rounded="full"
                        label="Photo"
                      />

                      {/* Champs */}
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <Label className="text-xs">Matricule</Label>
                          <Input
                            value={emp.matricule}
                            onChange={e => updateEmploye(emp.id, "matricule", e.target.value)}
                            placeholder="MAT-001"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-xs">Nom complet *</Label>
                          <Input
                            required
                            value={emp.nom}
                            onChange={e => updateEmploye(emp.id, "nom", e.target.value)}
                            placeholder="Prénom NOM"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Poste</Label>
                          <Input
                            value={emp.poste}
                            onChange={e => updateEmploye(emp.id, "poste", e.target.value)}
                            placeholder="Directeur…"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Catégorie</Label>
                          <Select
                            value={emp.type}
                            onValueChange={v => updateEmploye(emp.id, "type", v as TypeAssure)}
                          >
                            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="adulte">Adulte · {PRIME_ADULTE.toLocaleString()} FCFA</SelectItem>
                              <SelectItem value="adulte_age">Adulte âgé · {PRIME_ADULTE_AGE.toLocaleString()} FCFA</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 shrink-0">
                        {/* Toggle famille */}
                        <button
                          type="button"
                          onClick={() => setExpandedEmp(isOpen ? null : emp.id)}
                          className="text-xs text-blue-600 flex items-center gap-1 hover:underline whitespace-nowrap"
                        >
                          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          Famille ({emp.famille.length})
                        </button>
                        {employes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEmploye(emp.id)}
                            className="text-xs text-red-500 hover:underline flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Retirer
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Famille de l'employé */}
                    {isOpen && (
                      <div className="p-4 border-t space-y-3">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-muted-foreground">
                            Famille de <span className="text-foreground">{emp.nom || `Employé ${empIdx + 1}`}</span>
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => addMembre(emp.id)}
                          >
                            <Plus className="w-3 h-3 mr-1" /> Ajouter membre
                          </Button>
                        </div>
                        {emp.famille.length === 0 && (
                          <p className="text-xs text-muted-foreground italic">Aucun membre de famille — cliquer sur "Ajouter membre"</p>
                        )}
                        {emp.famille.map((m, mIdx) => (
                          <div key={mIdx} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                            <Input
                              required
                              placeholder="Nom du membre"
                              value={m.nom}
                              onChange={e => updateMembre(emp.id, mIdx, "nom", e.target.value)}
                              className="h-8 text-sm"
                            />
                            <Input
                              required
                              placeholder="Lien (Épouse, Fils…)"
                              value={m.lien}
                              onChange={e => updateMembre(emp.id, mIdx, "lien", e.target.value)}
                              className="h-8 text-sm"
                            />
                            <Select
                              value={m.type}
                              onValueChange={v => updateMembre(emp.id, mIdx, "type", v)}
                            >
                              <SelectTrigger className="h-8 text-sm w-32"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="adulte">Adulte</SelectItem>
                                <SelectItem value="adulte_age">Adulte âgé</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeMembre(emp.id, mIdx)}
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </section>

            {/* ── Décompte ── */}
            <section className="space-y-3">
              <h3 className="font-semibold text-base border-b pb-2">Décompte de la prime</h3>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-gray-50 border text-center">
                  <p className="text-xs text-muted-foreground">Employés</p>
                  <p className="font-bold text-lg">{employes.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-center">
                  <p className="text-xs text-muted-foreground">Adultes</p>
                  <p className="font-bold text-lg">{decompte.nbAdulte}</p>
                  <p className="text-xs text-blue-700">{PRIME_ADULTE.toLocaleString()} FCFA</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200 text-center">
                  <p className="text-xs text-muted-foreground">Adultes âgés</p>
                  <p className="font-bold text-lg">{decompte.nbAdulteAge}</p>
                  <p className="text-xs text-purple-700">{PRIME_ADULTE_AGE.toLocaleString()} FCFA</p>
                </div>
              </div>

              <div className="rounded-xl border overflow-hidden text-sm">
                <div className="bg-gray-50 px-4 py-2 font-semibold text-xs text-muted-foreground uppercase tracking-wide">
                  Décompte annuel × {duree} an{duree > 1 ? "s" : ""}
                </div>
                {[
                  {
                    label: `Prime nette adulte${decompte.nbAdulte > 1 ? "s" : ""} (${PRIME_ADULTE.toLocaleString()} × ${decompte.nbAdulte})`,
                    value: decompte.primeAdultes, show: decompte.nbAdulte > 0,
                  },
                  {
                    label: `Prime nette adulte${decompte.nbAdulteAge > 1 ? "s" : ""} âgé${decompte.nbAdulteAge > 1 ? "s" : ""} (${PRIME_ADULTE_AGE.toLocaleString()} × ${decompte.nbAdulteAge})`,
                    value: decompte.primeAdultesAge, show: decompte.nbAdulteAge > 0,
                  },
                  { label: "Prime nette totale",           value: decompte.primeNette,  show: true, bold: true },
                  { label: "Accessoires",                  value: decompte.accessoires, show: true },
                  { label: `Taxes (${(TAUX_TAXE * 100).toFixed(1)} %)`, value: decompte.taxes, show: true },
                ].filter(r => r.show).map((row, i) => (
                  <div key={i} className={`flex justify-between items-center px-4 py-2.5 border-t ${row.bold ? "bg-blue-50 font-semibold" : ""}`}>
                    <span>{row.label}</span>
                    <span className={`font-mono text-sm ${row.bold ? "text-blue-700" : ""}`}>
                      {(row.value * duree).toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-3 border-t bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <span className="font-bold text-base">TOTAL À PAYER</span>
                  <span className="font-bold text-xl font-mono">
                    {(decompte.total * duree).toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
              </div>
            </section>

            {/* ── Tableau des garanties ── */}
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

            {/* ── Réajustement S/P ── */}
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
                    Dans les 3 mois suivant l'échéance, un avenant de réajustement est établi en fonction du rapport S/P.
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-3 font-semibold">Rapport S/P</th>
                        <th className="text-left p-3 font-semibold">Ajustement</th>
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
              {editingId ? "Modifier le groupe" : "Créer le groupe"}
            </Button>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
