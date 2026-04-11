// Data service - connecté au backend Spring Boot API
import { apiClient } from './apiClient';


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

  static async updatePolice(id: string, data: any) {
    return await apiClient.updatePolice(id, data);
  }

  static async deletePolice(id: string) {
    return await apiClient.deletePolice(id);
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

  // Familles → backend /api/familles
  static async getFamilles() {
    const res = await apiClient.getFamilles();
    // Le backend retourne ApiResponse<List> donc apiClient extrait déjà .data
    return Array.isArray(res) ? res : (res as any)?.data ?? [];
  }

  static async createFamille(data: any) {
    const res = await apiClient.createFamille(data);
    return (res as any)?.data ?? res;
  }

  static async updateFamille(id: number, data: any) {
    const res = await apiClient.updateFamille(id, data);
    return (res as any)?.data ?? res;
  }

  static async deleteFamille(id: number) {
    return apiClient.deleteFamille(id);
  }

  static async getFamilleById(id: number) {
    const res = await apiClient.getFamilleById(id);
    return (res as any)?.data ?? res;
  }

  // Groupes → backend /api/groupes
  static async getGroupes() {
    const res = await apiClient.getGroupes();
    return Array.isArray(res) ? res : (res as any)?.data ?? [];
  }

  static async createGroupe(data: any) {
    const res = await apiClient.createGroupe(data);
    return (res as any)?.data ?? res;
  }

  static async updateGroupe(id: number, data: any) {
    const res = await apiClient.updateGroupe(id, data);
    return (res as any)?.data ?? res;
  }

  static async deleteGroupe(id: number) {
    return apiClient.deleteGroupe(id);
  }

  static async getGroupeById(id: number) {
    const res = await apiClient.getGroupeById(id);
    return (res as any)?.data ?? res;
  }
}
