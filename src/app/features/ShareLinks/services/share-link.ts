import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ShareLinkDto } from '../models/share-link.model';

@Injectable({
  providedIn: 'root',
})
export class ShareLink {
  private readonly http = inject(HttpClient);

  private baseUrl(projectId: number): string {
    return `${environment.apiBaseUrl}/Project/${projectId}/sharelink`;
  }

  getActive(projectId: number): Observable<ShareLinkDto> {
    return this.http.get<ShareLinkDto>(this.baseUrl(projectId));
  }

  create(projectId: number, createdByUserId?: number | null): Observable<ShareLinkDto> {
    let params = new HttpParams();
    if (createdByUserId != null) {
      params = params.set('createdByUserId', createdByUserId);
    }
    return this.http.post<ShareLinkDto>(this.baseUrl(projectId), {}, { params });
  }

  revoke(projectId: number): Observable<void> {
    return this.http.delete<void>(this.baseUrl(projectId));
  }
}
