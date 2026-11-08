export interface AuditLog {
  id: number;
  userId: number;
  username: string;
  action: string;
  entityType: string;
  entityId: number;
  details: string;
  actionDate: string;
}

export interface PageAuditLog {
  totalPages: number;
  totalElements: number;
  size: number;
  content: AuditLog[];
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface AuditFilter {
  entityType?: string;
  entityId?: number;
  userId?: number;
  page?: number;
  size?: number;
}