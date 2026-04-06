import { Assure, Beneficiaire, Police, Prestataire, Sinistre, Consultation, Prescription, StatCard } from "@/types/insurance";

export const senegalCities = [
  'Dakar',
  'Thiès',
  'Saint-Louis',
  'Ziguinchor',
  'Kaolack',
  'Mbour',
  'Diourbel',
  'Tambacounda',
  'Louga',
  'Fatick',
  'Kolda',
  'Matam',
  'Saint-Louis',
  'Sédhiou',
  'Kédougou'
];

export const defaultCity = 'Dakar';

const makeSenegalAddress = (city: string, neighborhood: string) => `${city}, ${neighborhood}`;

const currentYear = new Date().getFullYear();

const yearTag = (prefix: string, index: number) => `${prefix}-${currentYear}-${String(index).padStart(3, '0')}`;

const ymd = (year: number, month: number, day: number) => `${year.toString().padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const nextYear = currentYear + 1;

export const mockStats: StatCard[] = [
  { title: "Assurés actifs", value: "2,847", change: "+12%", trend: "up", icon: "users" },
  { title: "Polices en cours", value: "1,234", change: "+8%", trend: "up", icon: "shield" },
  { title: "Sinistres en cours", value: "156", change: "-5%", trend: "down", icon: "file-text" },
  { title: "Montant remboursé", value: "45.2M FCFA", change: "+15%", trend: "up", icon: "banknote" },
];

export const mockAssures: Assure[] = [
  { id: yearTag('ASS', 1), numero: yearTag('ASS', 1), nom: 'Diop', prenom: 'Moussa', dateNaissance: '1985-03-15', sexe: 'M', telephone: '+221 77 123 45 67', adresse: makeSenegalAddress('Dakar', 'Plateau'), email: 'moussa.diop@email.com', pieceIdentite: 'SN-1234567', profession: 'Ingénieur', dateSouscription: ymd(currentYear, 1, 15), dateDebut: ymd(currentYear, 2, 1), dateFin: ymd(nextYear, 1, 31), statut: 'Actif', type: 'famille' },
  { id: yearTag('ASS', 2), numero: yearTag('ASS', 2), nom: 'Fall', prenom: 'Aminata', dateNaissance: '1990-07-22', sexe: 'F', telephone: '+221 78 234 56 78', adresse: makeSenegalAddress('Dakar', 'Almadies'), email: 'aminata.fall@email.com', pieceIdentite: 'SN-2345678', profession: 'Médecin', dateSouscription: ymd(currentYear, 2, 10), dateDebut: ymd(currentYear, 3, 1), dateFin: ymd(nextYear, 2, 28), statut: 'Actif', type: 'famille' },
  { id: yearTag('ASS', 3), numero: yearTag('ASS', 3), nom: 'Ndiaye', prenom: 'Ibrahima', dateNaissance: '1978-11-08', sexe: 'M', telephone: '+221 76 345 67 89', adresse: makeSenegalAddress('Thiès', 'Centre'), email: 'ibrahima.ndiaye@email.com', pieceIdentite: 'SN-3456789', profession: 'Comptable', dateSouscription: ymd(currentYear, 3, 5), dateDebut: ymd(currentYear, 4, 1), dateFin: ymd(nextYear, 3, 31), statut: 'Actif', type: 'groupe' },
  { id: yearTag('ASS', 4), numero: yearTag('ASS', 4), nom: 'Sow', prenom: 'Fatou', dateNaissance: '1992-05-18', sexe: 'F', telephone: '+221 77 456 78 90', adresse: makeSenegalAddress('Saint-Louis', 'Centre'), email: 'fatou.sow@email.com', pieceIdentite: 'SN-4567890', profession: 'Enseignante', dateSouscription: ymd(currentYear, 1, 20), dateDebut: ymd(currentYear, 2, 15), dateFin: ymd(nextYear, 2, 14), statut: 'Suspendu', type: 'famille' },
  { id: yearTag('ASS', 5), numero: yearTag('ASS', 5), nom: 'Ba', prenom: 'Ousmane', dateNaissance: '1982-09-30', sexe: 'M', telephone: '+221 78 567 89 01', adresse: makeSenegalAddress('Dakar', 'Parcelles'), email: 'ousmane.ba@email.com', pieceIdentite: 'SN-5678901', profession: 'Commercial', dateSouscription: ymd(currentYear, 4, 1), dateDebut: ymd(currentYear, 5, 1), dateFin: ymd(nextYear, 4, 30), statut: 'Actif', type: 'groupe' },
];

export const mockPolices: Police[] = [
  { id: 'POL-001', numero: `POL-${currentYear}-001`, assurePrincipal: 'Moussa Diop', type: 'Famille', dateDebut: ymd(currentYear, 2, 1), dateFin: ymd(nextYear, 1, 31), statut: 'Active', montantCotisation: '350,000 FCFA', nbBeneficiaires: 4 },
  { id: 'POL-002', numero: `POL-${currentYear}-002`, assurePrincipal: 'Aminata Fall', type: 'Famille', dateDebut: ymd(currentYear, 3, 1), dateFin: ymd(nextYear, 2, 28), statut: 'Active', montantCotisation: '280,000 FCFA', nbBeneficiaires: 2 },
  { id: 'POL-003', numero: `POL-${currentYear}-003`, assurePrincipal: 'Sonatel SA', type: 'Groupe', dateDebut: ymd(currentYear, 1, 1), dateFin: ymd(currentYear, 12, 31), statut: 'Active', montantCotisation: '12,500,000 FCFA', nbBeneficiaires: 250 },
  { id: 'POL-004', numero: `POL-${currentYear}-004`, assurePrincipal: 'Fatou Sow', type: 'Famille', dateDebut: ymd(currentYear, 2, 15), dateFin: ymd(nextYear, 2, 14), statut: 'Suspendue', montantCotisation: '220,000 FCFA', nbBeneficiaires: 3 },
  { id: 'POL-005', numero: `POL-${currentYear}-005`, assurePrincipal: 'CBAO Group', type: 'Groupe', dateDebut: ymd(currentYear, 4, 1), dateFin: ymd(nextYear, 3, 31), statut: 'Active', montantCotisation: '8,750,000 FCFA', nbBeneficiaires: 180 },
];

export const mockPrestataires: Prestataire[] = [
  { id: "PRE-001", numero: "PRE-001", nom: "Dr. Abdoulaye Diallo", specialite: "Médecin Généraliste", telephone: "+221 77 111 22 33", email: "dr.diallo@clinic.sn", adresse: "Dakar, Médina", statut: "Actif" },
  { id: "PRE-002", numero: "PRE-002", nom: "Pharmacie Pasteur", specialite: "Pharmacie", telephone: "+221 33 822 44 55", email: "pasteur@pharma.sn", adresse: "Dakar, Plateau", statut: "Actif" },
  { id: "PRE-003", numero: "PRE-003", nom: "Clinique de la Madeleine", specialite: "Clinique", telephone: "+221 33 823 66 77", email: "contact@madeleine.sn", adresse: "Dakar, Madeleine", statut: "Actif" },
  { id: "PRE-004", numero: "PRE-004", nom: "Dr. Mariama Bâ", specialite: "Gynécologue", telephone: "+221 77 222 33 44", email: "dr.ba@sante.sn", adresse: "Dakar, Point E", statut: "Actif" },
  { id: "PRE-005", numero: "PRE-005", nom: "Laboratoire Bio24", specialite: "Laboratoire", telephone: "+221 33 824 88 99", email: "contact@bio24.sn", adresse: "Dakar, Fann", statut: "Inactif" },
];

export const mockSinistres: Sinistre[] = [
  { id: 'SIN-001', numero: `SIN-${currentYear}-001`, assure: 'Moussa Diop', type: 'Consultation', date: ymd(currentYear, 6, 15), montantReclame: '25,000 FCFA', montantValide: '20,000 FCFA', statut: 'Payé' },
  { id: 'SIN-002', numero: `SIN-${currentYear}-002`, assure: 'Aminata Fall', type: 'Hospitalisation', date: ymd(currentYear, 7, 2), montantReclame: '450,000 FCFA', montantValide: '405,000 FCFA', statut: 'Validé' },
  { id: 'SIN-003', numero: `SIN-${currentYear}-003`, assure: 'Ibrahima Ndiaye', type: 'Pharmacie', date: ymd(currentYear, 7, 10), montantReclame: '35,000 FCFA', montantValide: '', statut: 'En attente' },
  { id: 'SIN-004', numero: `SIN-${currentYear}-004`, assure: 'Fatou Sow', type: 'Analyses', date: ymd(currentYear, 7, 12), montantReclame: '85,000 FCFA', montantValide: '72,250 FCFA', statut: 'Validé' },
  { id: 'SIN-005', numero: `SIN-${currentYear}-005`, assure: 'Ousmane Ba', type: 'Consultation', date: ymd(currentYear, 7, 15), montantReclame: '15,000 FCFA', montantValide: '', statut: 'Rejeté' },
];

export const mockChartData = [
  { mois: "Jan", sinistres: 45, remboursements: 38 },
  { mois: "Fév", sinistres: 52, remboursements: 45 },
  { mois: "Mar", sinistres: 38, remboursements: 35 },
  { mois: "Avr", sinistres: 65, remboursements: 58 },
  { mois: "Mai", sinistres: 48, remboursements: 42 },
  { mois: "Jun", sinistres: 56, remboursements: 50 },
  { mois: "Jul", sinistres: 42, remboursements: 38 },
];

export const mockRecentActivity = [
  { id: 1, action: "Nouvelle police créée", detail: "POL-2024-005 - CBAO Group", time: "Il y a 2h", type: "creation" },
  { id: 2, action: "Sinistre validé", detail: "SIN-2024-002 - Aminata Fall", time: "Il y a 3h", type: "validation" },
  { id: 3, action: "Remboursement effectué", detail: "SIN-2024-001 - 20,000 FCFA", time: "Il y a 5h", type: "payment" },
  { id: 4, action: "Nouvel assuré ajouté", detail: "Ousmane Ba - ASS-2024-005", time: "Il y a 6h", type: "creation" },
  { id: 5, action: "Prescription ajoutée", detail: "Dr. Diallo pour Moussa Diop", time: "Il y a 8h", type: "medical" },
];
