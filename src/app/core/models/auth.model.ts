export type Role = 'ADMIN' | 'GESTIONNAIRE';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  fullName: string;
  role: Role;
  mustChangePassword: boolean;
}


export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
  recoveryCode: string | null;
}

export interface RecoveryResetRequest {
  username: string;
  recoveryCode: string;
  newPassword: string;
}

export interface RecoveryResetResponse {
  message: string;
  newRecoveryCode: string;
}

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'GESTIONNAIRE';
}