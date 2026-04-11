import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { DataService } from "@/services/dataService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Search, Building2, Users, TrendingUp, Pencil, Trash2,
  Calendar, RefreshCw, ShieldCheck, ChevronDown, ChevronUp, Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";
import { PhotoAvatar } from "@/components/PhotoUpload";
import {
  GARANTIES_CNART, REAJUSTEMENT_SP,
  PRIME_ADULTE, PRIME_ADULTE_AGE, TAUX_TAXE,
} from "./NewFamillePage";
import { calcDecompteGroupe, type Employe } from "./NewGroupePage";


// ─── Helpers ──────────────────────────────────────────────────────────────────

function echeanceGroupe(groupe: any): string {
  if (!groupe.debut || !groupe.dureeGarantie) return groupe.fin || "—";
  const d = new Date(groupe.debut);
  d.setFullYear(d.getFullYear() + Number(groupe.dureeGarantie));
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString("fr-FR");
}

function isExpiringSoon(groupe: any): boolean {
  if (!groupe.debut || !groupe.dureeGarantie) return false;
  const d = new Date(groupe.debut);
  d.setFullYear(d.getFullYear() + Number(groupe.dureeGarantie));
  d.setDate(d.getDate() - 1);
  return d.getTime() - Date.now() < 30 * 24 * 3600 * 1000 && d.getTime() > Date.now();
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function MaladieGroupePage() {
  const navigate = useNavigate();
  const [groupes, setGroupes]           = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(false);
  const [search, setSearch]             = useState("");
  const [showGaranties, setShowGaranties] = useState(false);
  const [showReajust, setShowReajust]     = useState(false);
  const [expandedGroupe, setExpandedGroupe] = useState<number | null>(null);
  const [expandedEmp, setExpandedEmp]       = useState<string | null>(null);

  useEffect(() => {
    DataService.getGroupes()
      .then(data => setGroupes(data ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const onDelete = async (id: number) => {
    await DataService.deleteGroupe(id);
    setGroupes(prev => prev.filter(g => g.id !== id));
  };

  const filtered = groupes.filter(g =>
    g.entreprise.toLowerCase().includes(search.toLowerCase())
  );

  // Stats globales
  const totalAssures = groupes.reduce((s, g) => {
    const emps: Employe[] = g.employesDetail || [];
    return s + emps.reduce((a, e) => a + 1 + e.famille.length, 0);
  }, 0);
  const totalPrime = groupes.reduce((s, g) => {
    const emps: Employe[] = g.employesDetail || [];
    const d = calcDecompteGroupe(emps);
    return s + d.total * Number(g.dureeGarantie || 1);
  }, 0);

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-muted-foreground">Chargement...</span>
      </div>
    </AppLayout>
  );

  if (error) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <Building2 className="w-10 h-10 text-muted-foreground opacity-30" />
        <p className="font-semibold text-lg">Impossible de joindre le serveur</p>
        <p className="text-sm text-muted-foreground">Vérifiez que le backend est démarré sur <code className="bg-muted px-1 rounded">localhost:3001</code></p>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6">

        {/* ── En-tête ── */}
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold">Maladie Groupe</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Polices entreprises — CNART · Taux 80 %</p>
          </div>
          <Button
            className="shrink-0 text-sm"
            onClick={() => navigate("/maladie-groupe/new")}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Nouveau Groupe</span>
          </Button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {[
            { icon: <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, bg: "from-blue-500 to-blue-600",    label: "Entreprises", value: groupes.length },
            { icon: <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, bg: "from-green-500 to-green-600", label: "Actifs",      value: groupes.filter(g => g.statut === "Actif").length },
            { icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,      bg: "from-purple-500 to-purple-600", label: "Assurés",   value: totalAssures },
            { icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />, bg: "from-indigo-500 to-indigo-600", label: "Primes",   value: totalPrime >= 1_000_000 ? `${(totalPrime/1_000_000).toFixed(1)}M F` : totalPrime >= 1000 ? `${(totalPrime/1000).toFixed(0)}k F` : `${totalPrime} F` },
          ].map((s, i) => (
            <Card key={i} className="p-2.5 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-2 sm:p-3 bg-gradient-to-br ${s.bg} rounded-lg shrink-0`}>{s.icon}</div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{s.label}</p>
                  <p className="text-base sm:text-xl font-bold truncate">{s.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Tableau des garanties CNART ── */}
        <Card className="overflow-hidden">
          <button
            type="button"
            onClick={() => setShowGaranties(!showGaranties)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-semibold text-sm">Tableau des garanties — Prise en charge au Sénégal</p>
                <p className="text-xs text-muted-foreground">Tous les actes couverts à 80 % · Cliquer pour afficher</p>
              </div>
            </div>
            {showGaranties ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showGaranties && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="text-left p-3 font-semibold">Nature des actes accordés à tous les bénéficiaires</th>
                    <th className="p-3 text-center font-semibold w-20">Taux</th>
                    <th className="text-left p-3 font-semibold">Plafond de remboursement</th>
                  </tr>
                </thead>
                <tbody>
                  {GARANTIES_CNART.map((row, i) => (
                    <tr key={i} className={`border-t ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      <td className="p-3">
                        <p className="font-semibold text-xs text-blue-700 uppercase">{row.categorie}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{row.actes}</p>
                      </td>
                      <td className="p-3 text-center font-bold text-green-700">{row.taux}</td>
                      <td className="p-3 text-xs text-muted-foreground">{row.plafond}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </Card>

        {/* ── Réajustement S/P ── */}
        <Card className="overflow-hidden">
          <button
            type="button"
            onClick={() => setShowReajust(!showReajust)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              <div className="text-left">
                <p className="font-semibold text-sm">Réajustement de la prime — Rapport S/P</p>
                <p className="text-xs text-muted-foreground">Avenant établi dans les 3 mois suivant l'échéance</p>
              </div>
            </div>
            {showReajust ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showReajust && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 font-semibold">Rapport S/P</th>
                    <th className="text-left p-3 font-semibold">Pourcentage d'ajustement</th>
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
            </motion.div>
          )}
        </Card>

        {/* ── Recherche ── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher une entreprise..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* ── Liste des groupes ── */}
        <div className="grid gap-6">
          {filtered.map((groupe, gi) => {
            const employes: Employe[] = groupe.employesDetail || [];
            const decompte = calcDecompteGroupe(employes);
            const duree    = Number(groupe.dureeGarantie || 1);
            const echeance = echeanceGroupe(groupe);
            const soon     = isExpiringSoon(groupe);
            const isOpen   = expandedGroupe === groupe.id;

            return (
              <motion.div
                key={groupe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: gi * 0.05 }}
              >
                <Card className={`overflow-hidden ${soon ? "border-orange-300" : ""}`}>
                  {soon && (
                    <div className="px-4 py-2 bg-orange-50 border-b border-orange-200 text-xs text-orange-700 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Échéance dans moins de 30 jours
                    </div>
                  )}

                  {/* ── En-tête groupe ── */}
                  <div className="p-4 sm:p-5">
                    <div className="flex gap-3 sm:gap-4 items-start">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shrink-0">
                        <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                          <h3 className="text-sm sm:text-xl font-semibold truncate">{groupe.entreprise}</h3>
                          <Badge variant={groupe.statut === "Actif" ? "default" : "secondary"}>{groupe.statut}</Badge>
                          {groupe.echeanceAuto && (
                            <span className="text-xs flex items-center gap-1 text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                              <RefreshCw className="w-3 h-3" /> Auto
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 truncate">{groupe.secteur}</p>

                        {/* Résumé population */}
                        <div className="flex flex-wrap gap-3 mb-3">
                          <div className="flex items-center gap-1.5 text-xs bg-gray-50 border px-2 py-1 rounded">
                            <Briefcase className="w-3 h-3" />
                            {employes.length} employé{employes.length > 1 ? "s" : ""}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-1 rounded">
                            <Users className="w-3 h-3" />
                            {decompte.nbAdulte} adulte{decompte.nbAdulte > 1 ? "s" : ""} · {PRIME_ADULTE.toLocaleString()} FCFA
                          </div>
                          {decompte.nbAdulteAge > 0 && (
                            <div className="flex items-center gap-1.5 text-xs bg-purple-50 border border-purple-200 text-purple-700 px-2 py-1 rounded">
                              <Users className="w-3 h-3" />
                              {decompte.nbAdulteAge} adulte{decompte.nbAdulteAge > 1 ? "s" : ""} âgé{decompte.nbAdulteAge > 1 ? "s" : ""} · {PRIME_ADULTE_AGE.toLocaleString()} FCFA
                            </div>
                          )}
                        </div>

                        {/* Infos clés */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Date début</p>
                            <p className="font-semibold text-sm">
                              {groupe.debut ? new Date(groupe.debut).toLocaleDateString("fr-FR") : "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Durée</p>
                            <p className="font-semibold text-sm">{duree} an{duree > 1 ? "s" : ""}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Échéance
                            </p>
                            <p className={`font-semibold text-sm ${soon ? "text-orange-600" : ""}`}>{echeance}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total à payer</p>
                            <p className="font-bold text-sm text-blue-700">
                              {(decompte.total * duree).toLocaleString("fr-FR")} FCFA
                            </p>
                          </div>
                        </div>

                        {/* Toggle décompte */}
                        <button
                          type="button"
                          onClick={() => setExpandedGroupe(isOpen ? null : groupe.id)}
                          className="text-xs text-blue-600 flex items-center gap-1 mb-3 hover:underline"
                        >
                          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {isOpen ? "Masquer" : "Voir"} le décompte & les employés
                        </button>

                        {/* Section dépliée */}
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4 mb-4"
                          >
                            {/* Décompte */}
                            <div className="rounded-lg border overflow-hidden text-sm">
                              {[
                                {
                                  label: `Prime nette adulte${decompte.nbAdulte > 1 ? "s" : ""} (${PRIME_ADULTE.toLocaleString()} × ${decompte.nbAdulte})`,
                                  val: decompte.primeAdultes * duree, show: decompte.nbAdulte > 0,
                                },
                                {
                                  label: `Prime nette adulte${decompte.nbAdulteAge > 1 ? "s" : ""} âgé${decompte.nbAdulteAge > 1 ? "s" : ""} (${PRIME_ADULTE_AGE.toLocaleString()} × ${decompte.nbAdulteAge})`,
                                  val: decompte.primeAdultesAge * duree, show: decompte.nbAdulteAge > 0,
                                },
                                { label: "Prime nette totale",               val: decompte.primeNette * duree,  show: true, bold: true },
                                { label: "Accessoires",                      val: decompte.accessoires,         show: true },
                                { label: `Taxes (${(TAUX_TAXE * 100).toFixed(1)} %)`, val: decompte.taxes * duree, show: true },
                              ].filter(r => r.show).map((row, idx) => (
                                <div key={idx} className={`flex justify-between px-4 py-2.5 border-t ${row.bold ? "bg-blue-50 font-semibold" : ""}`}>
                                  <span>{row.label}</span>
                                  <span className={`font-mono ${row.bold ? "text-blue-700" : ""}`}>
                                    {row.val.toLocaleString("fr-FR")} FCFA
                                  </span>
                                </div>
                              ))}
                              <div className="flex justify-between px-4 py-3 border-t bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold">
                                <span>TOTAL À PAYER</span>
                                <span className="font-mono">{(decompte.total * duree).toLocaleString("fr-FR")} FCFA</span>
                              </div>
                            </div>

                            {/* Liste employés avec photos */}
                            <div>
                              <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-600" />
                                Liste des employés assurés
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {employes.map((emp) => {
                                  const empOpen = expandedEmp === emp.id;
                                  const totalMembres = 1 + emp.famille.length;
                                  const primeEmp = (
                                    (emp.type === "adulte" ? PRIME_ADULTE : PRIME_ADULTE_AGE) +
                                    emp.famille.reduce((s, m) => s + (m.type === "adulte" ? PRIME_ADULTE : PRIME_ADULTE_AGE), 0)
                                  ) * duree;

                                  return (
                                    <Card key={emp.id} className="p-3 border border-blue-100">
                                      <div className="flex items-start gap-3">
                                        {/* Photo employé */}
                                        <PhotoAvatar
                                          photo={emp.photo}
                                          nom={emp.nom || "?"}
                                          size="md"
                                          rounded="full"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-1">
                                            <div>
                                              <p className="font-semibold text-sm leading-tight">{emp.nom || "—"}</p>
                                              <p className="text-xs text-muted-foreground">{emp.poste}</p>
                                              {emp.matricule && (
                                                <p className="text-xs text-blue-600 font-mono">{emp.matricule}</p>
                                              )}
                                            </div>
                                            <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                                              emp.type === "adulte_age"
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-blue-100 text-blue-700"
                                            }`}>
                                              {emp.type === "adulte_age" ? "Âgé" : "Adulte"}
                                            </span>
                                          </div>

                                          <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-muted-foreground">
                                              {totalMembres} assuré{totalMembres > 1 ? "s" : ""} · {primeEmp.toLocaleString("fr-FR")} FCFA
                                            </p>
                                            {emp.famille.length > 0 && (
                                              <button
                                                type="button"
                                                onClick={() => setExpandedEmp(empOpen ? null : emp.id)}
                                                className="text-xs text-blue-600 flex items-center gap-0.5 hover:underline"
                                              >
                                                {empOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                Famille ({emp.famille.length})
                                              </button>
                                            )}
                                          </div>

                                          {/* Famille dépliée */}
                                          {empOpen && emp.famille.length > 0 && (
                                            <motion.div
                                              initial={{ opacity: 0 }}
                                              animate={{ opacity: 1 }}
                                              className="mt-2 space-y-1 border-t pt-2"
                                            >
                                              {emp.famille.map((m, mi) => (
                                                <div key={mi} className="flex items-center gap-2 text-xs">
                                                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0">
                                                    {m.nom?.[0] || "?"}
                                                  </div>
                                                  <span className="flex-1 truncate">{m.nom} <span className="text-muted-foreground">({m.lien})</span></span>
                                                  <span className={`px-1 rounded text-xs shrink-0 ${
                                                    m.type === "adulte_age" ? "bg-purple-100 text-purple-600" : "bg-blue-50 text-blue-600"
                                                  }`}>
                                                    {m.type === "adulte_age" ? "Âgé" : "Adulte"}
                                                  </span>
                                                </div>
                                              ))}
                                            </motion.div>
                                          )}
                                        </div>
                                      </div>
                                    </Card>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => navigate(`/maladie-groupe/new?id=${groupe.id}`)}
                            variant="outline" size="sm" className="text-xs h-8"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            <span>Modifier</span>
                          </Button>
                          <Button
                            onClick={() => onDelete(groupe.id)}
                            variant="destructive" size="sm" className="text-xs h-8"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            <span>Supprimer</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun groupe trouvé</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
