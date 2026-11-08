import { OperationStatus } from './common.model';

// ===== Dépenses =====

export interface Depense {
  id: number;
  categorieId: number;
  categorieName: string;
  amount: number;
  expenseDate: string;
  description: string;
  registeredByUsername: string;
  status: OperationStatus;
}

export interface CreateDepenseRequest {
  categorieId: number;
  amount: number;
  expenseDate?: string;
  description?: string;
  confirmDuplicate?: boolean;
}

// ===== Catégories de dépenses =====

export interface CategorieDepense {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

export interface CreateCategorieDepenseRequest {
  name: string;
  description?: string;
}

export type CategorieDepenseFilter = 'ACTIVE' | 'INACTIVE' | 'ALL';

// ===== Autres recettes =====

export interface AutreRecette {
  id: number;
  source: string;
  amount: number;
  recetteDate: string;
  description: string;
  registeredByUsername: string;
  status: OperationStatus;
}

export interface CreateAutreRecetteRequest {
  source: string;
  amount: number;
  recetteDate?: string;
  description?: string;
  confirmDuplicate?: boolean;
}

// ===== Trésorerie =====

export interface LigneDetail {
  source: string;
  montant: number;
}

export interface Tresorerie {
  year: number;
  month: number;
  totalRecettes: number;
  totalDepenses: number;
  solde: number;
  detailRecettes: LigneDetail[];
  detailDepenses: LigneDetail[];
}