import { EnfantStatus } from './common.model';

export interface Enfant {
  id: number;
  matricule: string;
  firstName: string;
  lastName: string;
  fullName: string;
  birthDate: string;
  approximateAge: number;
  gender: 'M' | 'F';
  guardianName: string;
  guardianPhone: string;
  neighborhood: string;
  entryDate: string;
  status: EnfantStatus;
  roomGroup: string;
  registrationFee: number;
  monthlyFee: number;
}

export interface CreateEnfantRequest {
  firstName: string;
  lastName: string;
  birthDate?: string;
  approximateAge?: number;
  gender: 'M' | 'F';
  guardianName: string;
  guardianPhone: string;
  neighborhood?: string;
  entryDate: string;
  roomGroup?: string;
  registrationFee: number;
  monthlyFee: number;
}

export interface UpdateEnfantRequest {
  firstName: string;
  lastName: string;
  birthDate?: string;
  approximateAge?: number;
  gender: 'M' | 'F';
  guardianName: string;
  guardianPhone: string;
  neighborhood?: string;
  roomGroup?: string;
  registrationFee: number;
  monthlyFee: number;
}

export interface EnfantStats {
  totalActifs: number;
  totalSortis: number;
  totalEnVacances: number;
  nouveauxCeMois: number;
  impayesCeMois: number;
}