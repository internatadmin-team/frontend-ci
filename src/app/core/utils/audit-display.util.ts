import {
  ENFANT_STATUS_LABELS,
  EMPLOYE_STATUS_LABELS,
  EMPLOYE_FUNCTION_LABELS,
  CONTRACT_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_TYPE_LABELS,
} from '../models/common.model';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export const ENTITY_TYPE_LABELS: Record<string, string> = {
  Enfant: 'Élève',
  Employe: 'Employé',
  User: 'Utilisateur',
  PaiementEnfant: 'Paiement élève',
  PaiementSalaire: 'Paiement salaire',
  Depense: 'Dépense',
  CategorieDepense: 'Catégorie de dépense',
  AutreRecette: 'Autre recette',
  Parametres: 'Paramètres',
};

export const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Création',
  UPDATE: 'Modification',
  UPDATE_STATUS: 'Changement de statut',
  ACTIVATE: 'Activation',
  DEACTIVATE: 'Désactivation',
  CANCEL: 'Annulation',
  PRINT_CERTIFICATE: 'Impression certificat',
  PRINT_CARD: 'Impression carte',
  PRINT_RECEIPT: 'Impression reçu',
  UPLOAD_LOGO: 'Envoi du logo',
};

export const ACTION_VARIANTS: Record<string, BadgeVariant> = {
  CREATE: 'success',
  ACTIVATE: 'success',
  UPDATE: 'info',
  UPDATE_STATUS: 'info',
  PRINT_CERTIFICATE: 'info',
  PRINT_CARD: 'info',
  PRINT_RECEIPT: 'info',
  UPLOAD_LOGO: 'info',
  DEACTIVATE: 'warning',
  CANCEL: 'error',
};

const FIELD_LABELS: Record<string, string> = {
  matricule: 'Matricule',
  firstName: 'Prénom',
  lastName: 'Nom',
  fullName: 'Nom complet',
  birthDate: 'Date de naissance',
  approximateAge: 'Âge approximatif',
  gender: 'Genre',
  guardianName: 'Nom du tuteur',
  guardianPhone: 'Téléphone du tuteur',
  neighborhood: 'Quartier',
  entryDate: "Date d'entrée",
  status: 'Statut',
  roomGroup: 'Chambre / Groupe',
  registrationFee: "Frais d'inscription",
  monthlyFee: 'Mensualité',
  phone: 'Téléphone',
  function: 'Fonction',
  contractType: 'Type de contrat',
  baseSalary: 'Salaire de base',
  hireDate: "Date d'embauche",
  username: "Nom d'utilisateur",
  role: 'Rôle',
  active: 'Compte actif',
  mustChangePassword: 'Doit changer son mot de passe',
  enfantId: 'Élève (identifiant)',
  enfantFullName: 'Élève',
  enfantMatricule: 'Matricule élève',
  employeId: 'Employé (identifiant)',
  employeFullName: 'Employé',
  employeMatricule: 'Matricule employé',
  paymentType: 'Type de paiement',
  paymentMethod: 'Moyen de paiement',
  amount: 'Montant (FCFA)',
  concernedMonth: 'Mois concerné',
  paymentDate: 'Date de paiement',
  registeredByUsername: 'Enregistré par',
  balanceAfter: 'Solde après paiement',
  isPartial: 'Paiement partiel',
  expectedAmount: 'Montant attendu',
  excessAmount: 'Excédent',
  categorieId: 'Catégorie (identifiant)',
  categorieName: 'Catégorie',
  expenseDate: 'Date de la dépense',
  description: 'Description',
  source: 'Source',
  recetteDate: 'Date de la recette',
  name: 'Nom',
  address: 'Adresse',
  email: 'Email',
  directorName: 'Nom du directeur',
  hasLogo: 'Logo présent',
  message: 'Message',
};

const VALUE_LABELS: Record<string, string> = {
  ...ENFANT_STATUS_LABELS,
  ...EMPLOYE_STATUS_LABELS,
  ...EMPLOYE_FUNCTION_LABELS,
  ...CONTRACT_TYPE_LABELS,
  ...PAYMENT_METHOD_LABELS,
  ...PAYMENT_TYPE_LABELS,
  VALIDE: 'Validé',
  ANNULE: 'Annulé',
  ADMIN: 'Administrateur',
  GESTIONNAIRE: 'Gestionnaire',
  M: 'Garçon',
  F: 'Fille',
  true: 'Oui',
  false: 'Non',
};

const HIDDEN_FIELDS = new Set(['id']);
const DISPLAY_NAME_FIELDS = ['fullName', 'enfantFullName', 'employeFullName', 'categorieName', 'source', 'name'];

export interface DetailField {
  label: string;
  value: string;
}

export function entityLabel(type: string): string {
  return ENTITY_TYPE_LABELS[type] ?? type;
}

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export function actionVariant(action: string): BadgeVariant {
  return ACTION_VARIANTS[action] ?? 'neutral';
}

/** Transforme le toString() Java brut (ex: EnfantResponse[id=4, matricule=...]) en paires clé/valeur brutes */
export function parseRawFields(details: string): Record<string, string> {
  const match = details.match(/^\w+\[(.*)\]$/s);
  const inner = match ? match[1] : details;
  const parts = inner.split(/,\s+(?=[A-Za-z0-9_]+=)/);

  const fields: Record<string, string> = {};
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    fields[key] = value;
  }
  return fields;
}

/** Titre lisible : nom de l'élève/employé/catégorie concerné, sinon repli sur le numéro */
export function rowTitle(entityType: string, entityId: number, details: string): string {
  const raw = parseRawFields(details);
  for (const key of DISPLAY_NAME_FIELDS) {
    if (raw[key]) return raw[key];
  }
  return `${entityLabel(entityType)} n°${entityId}`;
}

/** Liste des détails traduits en français, prête à afficher */
export function parseDetails(details: string): DetailField[] {
  const raw = parseRawFields(details);
  const result: DetailField[] = [];

  for (const [key, value] of Object.entries(raw)) {
    if (HIDDEN_FIELDS.has(key) || value === '') continue;
    result.push({
      label: FIELD_LABELS[key] ?? key,
      value: VALUE_LABELS[value] ?? value,
    });
  }
  return result;
}