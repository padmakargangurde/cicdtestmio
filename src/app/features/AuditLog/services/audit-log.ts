import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuditLogEntryDto } from '../models/audit-log.model';

@Injectable({
  providedIn: 'root',
})
export class AuditLog {
  private readonly http = inject(HttpClient);

  getForProject(projectId: number): Observable<AuditLogEntryDto[]> {
    return this.http.get<AuditLogEntryDto[]>(`${environment.apiBaseUrl}/Project/${projectId}/audit-log`);
  }
}
