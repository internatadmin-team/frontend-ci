import { Role } from './auth.model';
// Nommé "UserSummary" (et non "User") pour ne pas entrer en collision
// avec l'utilisateur connecté défini dans auth.model.ts

export interface UserSummary {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  active: boolean;
  mustChangePassword: boolean;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
}

export interface CreateUserResponse {
  username: string;
  temporaryPassword: string;
  fullName: string;
}

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
}

export interface UserStats {
  totalUtilisateurs: number;
  totalActifs: number;
  totalDesactives: number;
  totalAdmins: number;
  totalGestionnaires: number;
  comptesEnAttenteChangementMdp: number;
}