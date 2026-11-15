import { PaymentMethod, PaymentType, OperationStatus } from './common.model';

// ===== Paiements Élèves =====

export interface PaiementEnfant {
  id: number;
  enfantId: number;
  enfantFullName: string;
  enfantMatricule: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  amount: number;
  concernedMonth: string;
  paymentDate: string;
  registeredByUsername: string;
  status: OperationStatus;
  balanceAfter: number;
  isPartial: boolean;
  expectedAmount: number;
  excessAmount: number;
}

export interface CreatePaiementEnfantRequest {
  enfantId: number;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  amount: number;
  concernedYear?: number;
  concernedMonth?: number;
  paymentDate?: string;
  confirmPartial?: boolean;
}

export interface RecuPaiement {
  paiementId: number;
  enfantMatricule: string;
  enfantFullName: string;
  guardianName: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  amount: number;
  concernedMonth: string;
  paymentDate: string;
  balanceAfter: number;
  isPartial: boolean;
  registeredByUsername: string;
  libelleStatut: string;
}

/** Suivi des mensualités (endpoint /paiements-enfants/mensualites) */
export interface SuiviMensuel {
  enfantId: number;
  matricule: string;
  fullName: string;
  guardianName: string;
  guardianPhone: string;
  montantDu: number;
  montantPaye: number;
  montantRestant: number;
  excedent: number;
  statutPaiement: string;
  paiementIds: number[];
}

/** Suivi des inscriptions (endpoint /paiements-enfants/inscriptions) */
export interface InscriptionSuivi {
  enfantId: number;
  matricule: string;
  fullName: string;
  montantAttendu: number;
  statut: string;
  paymentDate: string | null;
  paiementId: number | null;
}

// ===== Paiements Salaires =====

export interface PaiementSalaire {
  id: number;
  employeId: number;
  employeFullName: string;
  employeMatricule: string;
  paymentMethod: PaymentMethod;
  amount: number;
  concernedMonth: string;
  paymentDate: string;
  registeredByUsername: string;
  status: OperationStatus;
}

export interface CreatePaiementSalaireRequest {
  employeId: number;
  paymentMethod: PaymentMethod;
  concernedYear: number;
  concernedMonth: number;
  paymentDate?: string;
}

export interface RecuSalaire {
  paiementId: number;
  employeMatricule: string;
  employeFullName: string;
  employeFunction: string;
  paymentMethod: PaymentMethod;
  amount: number;
  concernedMonth: string;
  paymentDate: string;
  registeredByUsername: string;
}

/** Suivi des salaires (endpoint /paiements-salaires) */
export interface SalaireSuivi {
  employeId: number;
  matricule: string;
  fullName: string;
  montantAttendu: number;
  statut: string;
  paymentDate: string | null;
  paiementId: number | null;
}

export type SuiviStatusFilter = 'ALL' | 'PAYE' | 'IMPAYE' | 'PARTIEL';