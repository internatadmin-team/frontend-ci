import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiConfigService {
  readonly baseUrl = environment.apiUrl;

  getUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }
}