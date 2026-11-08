// Enums partagés par plusieurs domaines métier (paiements, employés, élèves...)

export type PaymentMethod = 'ESPECES' | 'WAVE' | 'ORANGE_MONEY' | 'VIREMENT';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  ESPECES: 'Espèces',
  WAVE: 'Wave',
  ORANGE_MONEY: 'Orange Money',
  VIREMENT: 'Virement bancaire',
};

export type PaymentType = 'INSCRIPTION' | 'MENSUALITE';

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  INSCRIPTION: 'Frais d\'inscription',
  MENSUALITE: 'Mensualité',
};

export type OperationStatus = 'VALIDE' | 'ANNULE';

export type EnfantStatus = 'ACTIF' | 'SORTI' | 'EN_VACANCES';

export const ENFANT_STATUS_LABELS: Record<EnfantStatus, string> = {
  ACTIF: 'Actif',
  SORTI: 'Sorti',
  EN_VACANCES: 'En vacances',
};

export type EmployeStatus = 'ACTIF' | 'EN_CONGE' | 'ANCIEN';

export const EMPLOYE_STATUS_LABELS: Record<EmployeStatus, string> = {
  ACTIF: 'Actif',
  EN_CONGE: 'En congé',
  ANCIEN: 'Ancien',
};

export type EmployeFunction =
  | 'MAITRE_CORANIQUE'
  | 'MAITRE_FRANCAIS'
  | 'SURVEILLANT'
  | 'CUISINIER'
  | 'AGENT_ENTRETIEN'
  | 'GARDIEN';

export const EMPLOYE_FUNCTION_LABELS: Record<EmployeFunction, string> = {
  MAITRE_CORANIQUE: 'Maître coranique',
  MAITRE_FRANCAIS: 'Maître de français',
  SURVEILLANT: 'Surveillant',
  CUISINIER: 'Cuisinier',
  AGENT_ENTRETIEN: 'Agent d\'entretien',
  GARDIEN: 'Gardien',
};

export type ContractType = 'TEMPS_PLEIN' | 'PARTIEL';

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  TEMPS_PLEIN: 'Temps plein',
  PARTIEL: 'Temps partiel',
};

export interface PrintActionResponse {
  id: number;
  message: string;
}


export const SUIVI_STATUS_LABELS: Record<string, string> = {
  PAYE: 'Payé',
  IMPAYE: 'Impayé',
  PARTIEL: 'Partiel',
  ALL: 'Tous',
};

/** Convertit un Record<enum, label> en tableau d'options pour les <select> */
export function toSelectOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return Object.entries(labels).map(([value, label]) => ({ value: value as T, label: label as string }));
}