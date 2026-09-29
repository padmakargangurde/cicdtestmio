import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FinalSubmissionStatusDto } from '../../FinalSubmission/models/final-submission.model';
import {
  ClientReviewDto,
  IdentifyClientRequest,
  IdentifyClientResult,
  ItemResponseDto,
  SubmitFinalRequest,
  SubmitResponseRequest,
} from '../models/client-review.model';

@Injectable({
  providedIn: 'root',
})
export class ClientReview {
  private readonly http = inject(HttpClient);

  private baseUrl(token: string): string {
    return `${environment.apiBaseUrl}/ClientReview/${token}`;
  }

  getByToken(token: string): Observable<ClientReviewDto> {
    return this.http.get<ClientReviewDto>(this.baseUrl(token));
  }

  identify(token: string, request: IdentifyClientRequest): Observable<IdentifyClientResult> {
    return this.http.post<IdentifyClientResult>(`${this.baseUrl(token)}/identify`, request);
  }

  exportExcel(token: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl(token)}/export`, { responseType: 'blob' });
  }

  submitResponse(
    token: string,
    itemIdentityId: number,
    request: SubmitResponseRequest,
  ): Observable<ItemResponseDto> {
    return this.http.put<ItemResponseDto>(`${this.baseUrl(token)}/items/${itemIdentityId}`, request);
  }

  submitFinal(token: string, request: SubmitFinalRequest): Observable<FinalSubmissionStatusDto> {
    return this.http.post<FinalSubmissionStatusDto>(`${this.baseUrl(token)}/final-submission`, request);
  }
}
