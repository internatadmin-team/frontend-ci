export interface Parametres {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  directorName: string;
  hasLogo: boolean;
}

export interface UpdateParametresRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  directorName?: string;
}