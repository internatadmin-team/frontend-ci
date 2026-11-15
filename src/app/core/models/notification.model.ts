export type NotificationSeverity = 'INFO' | 'WARNING' | 'ERROR' | string;

export interface NotificationItem {
  type: string;
  severity: NotificationSeverity;
  message: string;
  count: number;
}