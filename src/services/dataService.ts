// Data service - connecté au backend Spring Boot API
import { apiClient } from './apiClient';

// Données locales pour Familles et Groupes (pas d'endpoint backend dédié)
let localFamilles: any[] = [
  {
    id: 1,
    principal: "Amadou Diallo",
    telephone: "+221 77 123 45 67",
    beneficiaires: ["Fatou Diallo (Épouse)", "Moussa Diallo (Fils)", "Aïcha Diallo (Fille)"],
    dateDebut: "2024-01-15",
    dateFin: "2025-01-14",
    prime: "850000",
    statut: "Actif"
  }
];

let localGroupes: any[] = [
  {
    id: 1,
    entreprise: "Sonatel SA",
    secteur: "Télécommunications",
    employes: 450,
    assures: 1350,
    debut: "2024-01-01",
    fin: "2024-12-31",
    prime: "45000000",
    statut: "Actif"
  }
];

export class DataService {

  // Assurés
  static async getAssures() {
    const response = await apiClient.getAssures();
    return response.assures;
  }

  static async getAssureById(id: string) {
    return await apiClient.getAssureById(id);
  }

  static async createAssure(data: any) {
    return await apiClient.createAssure(data);
  }

  static async updateAssure(id: string, data: any) {
    return await apiClient.updateAssure(id, data);
  }

  static async deleteAssure(id: string) {
    return await apiClient.deleteAssure(id);
  }

  // Polices
  static async getPolices() {
    const response = await apiClient.getPolices();
    return response.polices;
  }

  static async createPolice(data: any) {
    return await apiClient.createPolice(data);
  }

  // Sinistres
  static async getSinistres() {
    const response = await apiClient.getSinistres();
    return response.sinistres;
  }

  static async getSinistreById(id: string) {
    return await apiClient.getSinistreById(id);
  }

  static async createSinistre(data: any) {
    return await apiClient.createSinistre(data);
  }

  // Prestataires
  static async getPrestataires() {
    const response = await apiClient.getPrestataires();
    return response.prestataires;
  }

  static async createPrestataire(data: any) {
    return await apiClient.createPrestataire(data);
  }

  // Consultations
  static async getConsultations() {
    const response = await apiClient.getConsultations();
    return response.consultations;
  }

  static async createConsultation(data: any) {
    return await apiClient.createConsultation(data);
  }

  // Prescriptions
  static async getPrescriptions() {
    const response = await apiClient.getPrescriptions();
    return response.prescriptions;
  }

  static async createPrescription(data: any) {
    return await apiClient.createPrescription(data);
  }

  // Users
  static async getUsers() {
    const response = await apiClient.getUsers();
    return response.users;
  }

  static async updateUser(id: string, data: any) {
    return await apiClient.updateUser(id, data);
  }

  static async deleteUser(id: string) {
    return await apiClient.deleteUser(id);
  }

  // Familles (local)
  static async getFamilles() {
    return localFamilles;
  }

  static async createFamille(data: any) {
    const newFamille = { ...data, id: Date.now() };
    localFamilles.push(newFamille);
    return newFamille;
  }

  static async updateFamille(id: number, data: any) {
    localFamilles = localFamilles.map(f => f.id === id ? { ...f, ...data } : f);
    return data;
  }

  static async deleteFamille(id: number) {
    localFamilles = localFamilles.filter(f => f.id !== id);
    return { success: true };
  }

  static async getFamilleById(id: number) {
    return localFamilles.find(f => f.id === id) || null;
  }

  // Groupes (local)
  static async getGroupes() {
    return localGroupes;
  }

  static async createGroupe(data: any) {
    const newGroupe = { ...data, id: Date.now() };
    localGroupes.push(newGroupe);
    return newGroupe;
  }

  static async updateGroupe(id: number, data: any) {
    localGroupes = localGroupes.map(g => g.id === id ? { ...g, ...data } : g);
    return data;
  }

  static async deleteGroupe(id: number) {
    localGroupes = localGroupes.filter(g => g.id !== id);
    return { success: true };
  }

  static async getGroupeById(id: number) {
    return localGroupes.find(g => g.id === id) || null;
  }
}
