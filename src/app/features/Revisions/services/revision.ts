import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RevisionDetailDto, RevisionListItemDto, UploadRevisionResult } from '../models/revision.model';

@Injectable({
  providedIn: 'root',
})
export class Revision {
  private readonly http = inject(HttpClient);

  private baseUrl(projectId: number): string {
    return `${environment.apiBaseUrl}/Project/${projectId}/revisions`;
  }

  getAll(projectId: number): Observable<RevisionListItemDto[]> {
    return this.http.get<RevisionListItemDto[]>(this.baseUrl(projectId));
  }

  getActive(projectId: number): Observable<RevisionDetailDto> {
    return this.http.get<RevisionDetailDto>(`${this.baseUrl(projectId)}/active`);
  }

  getById(projectId: number, revisionId: number): Observable<RevisionDetailDto> {
    return this.http.get<RevisionDetailDto>(`${this.baseUrl(projectId)}/${revisionId}`);
  }

  upload(projectId: number, file: File, uploadedByUserId?: number | null): Observable<UploadRevisionResult> {
    const form = new FormData();
    form.append('file', file);
    if (uploadedByUserId != null) {
      form.append('uploadedByUserId', String(uploadedByUserId));
    }
    return this.http.post<UploadRevisionResult>(this.baseUrl(projectId), form);
  }

  exportExcel(projectId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl(projectId)}/export`, { responseType: 'blob' });
  }
}
