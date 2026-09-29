import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateProjectRequest,
  ProjectDetailDto,
  ProjectListItemDto,
  UpdateProjectRequest,
} from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class Project {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/Project`;

  getAll(): Observable<ProjectListItemDto[]> {
    return this.http.get<ProjectListItemDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<ProjectDetailDto> {
    return this.http.get<ProjectDetailDto>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateProjectRequest): Observable<ProjectDetailDto> {
    return this.http.post<ProjectDetailDto>(this.baseUrl, request);
  }

  update(id: number, request: UpdateProjectRequest): Observable<ProjectDetailDto> {
    return this.http.put<ProjectDetailDto>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
