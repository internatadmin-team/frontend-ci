import { TestBed } from '@angular/core/testing';
import { environment as environmentProd } from '../../../environments/environment.prod';
import { ApiConfigService } from './api-config.service';

describe('ApiConfigService', () => {
  it('construit une URL a partir de la base configuree', () => {
    const service = TestBed.inject(ApiConfigService);
    expect(service.getUrl('/enfants')).toBe(`${service.baseUrl}/enfants`);
  });

  it('utilise en production une URL relative, servie par le reverse proxy', () => {
    expect(environmentProd.apiUrl).toBe('/api');
  });
});
