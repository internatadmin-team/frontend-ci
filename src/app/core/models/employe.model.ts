import { EmployeStatus, EmployeFunction, ContractType } from './common.model';

export interface Employe {
  id: number;
  matricule: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  function: EmployeFunction;
  contractType: ContractType;
  baseSalary: number;
  hireDate: string;
  status: EmployeStatus;
}

export interface CreateEmployeRequest {
  firstName: string;
  lastName: string;
  phone: string;
  function: EmployeFunction;
  contractType: ContractType;
  baseSalary: number;
  hireDate: string;
}

export interface UpdateEmployeRequest {
  firstName: string;
  lastName: string;
  phone: string;
  function: EmployeFunction;
  contractType: ContractType;
  baseSalary: number;
}

export interface EmployeStats {
  totalActifs: number;
  totalEnConge: number;
  totalAnciens: number;
  salairesPayesCeMois: number;
  salairesRestants: number;
}