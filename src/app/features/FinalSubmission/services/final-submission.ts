import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FinalSubmissionStatusDto } from '../models/final-submission.model';

@Injectable({
  providedIn: 'root',
})
export class FinalSubmission {
  private readonly http = inject(HttpClient);

  private baseUrl(projectId: number): string {
    return `${environment.apiBaseUrl}/Project/${projectId}/final-submission`;
  }

  getStatus(projectId: number): Observable<FinalSubmissionStatusDto> {
    return this.http.get<FinalSubmissionStatusDto>(this.baseUrl(projectId));
  }

  reopen(projectId: number, reopenedByUserId?: number | null): Observable<FinalSubmissionStatusDto> {
    let params = new HttpParams();
    if (reopenedByUserId != null) {
      params = params.set('reopenedByUserId', reopenedByUserId);
    }
    return this.http.post<FinalSubmissionStatusDto>(`${this.baseUrl(projectId)}/reopen`, {}, { params });
  }
}
