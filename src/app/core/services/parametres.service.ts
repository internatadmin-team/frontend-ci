import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { Parametres, UpdateParametresRequest } from '../models/parametres.model';

@Injectable({ providedIn: 'root' })
export class ParametresService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  get(): Observable<Parametres> {
    return this.http.get<Parametres>(this.apiConfig.getUrl('/parametres'));
  }

  update(data: UpdateParametresRequest): Observable<Parametres> {
    return this.http.put<Parametres>(this.apiConfig.getUrl('/parametres'), data);
  }

  /**
   * Le backend renvoie en réalité l'image brute (content-type: image/jpeg),
   * malgré ce que suggère le Swagger (format "byte"/base64) — on récupère
   * donc un Blob directement, pas du texte.
   */
  getLogoBlob(): Observable<Blob> {
    return this.http.get(this.apiConfig.getUrl('/parametres/logo'), { responseType: 'blob' });
  }

  uploadLogo(file: File): Observable<Parametres> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Parametres>(this.apiConfig.getUrl('/parametres/logo'), formData);
  }
}