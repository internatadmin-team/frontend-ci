import { Component, input, computed } from '@angular/core';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  ACTIF: { label: 'Actif', variant: 'success' },
  SORTI: { label: 'Sorti', variant: 'neutral' },
  EN_VACANCES: { label: 'En vacances', variant: 'info' },
  EN_CONGE: { label: 'En congé', variant: 'warning' },
  ANCIEN: { label: 'Ancien', variant: 'neutral' },
  VALIDE: { label: 'Validé', variant: 'success' },
  ANNULE: { label: 'Annulé', variant: 'error' },
  PAYE: { label: 'Payé', variant: 'success' },
  IMPAYE: { label: 'Impayé', variant: 'error' },
  PARTIEL: { label: 'Partiel', variant: 'warning' },
  ALL: { label: 'Tous', variant: 'neutral' },
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="status-badge" [class]="config().variant">{{ config().label }}</span>`,
})
export class StatusBadgeComponent {
  status = input.required<string>();

  config = computed<StatusConfig>(() => {
    return STATUS_MAP[this.status()?.toUpperCase()] ?? { label: this.status(), variant: 'neutral' };
  });
}