import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CreateUserRequest, UpdateUserRequest, UserDetailDto, UserListItemDto } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class User {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/User`;

  getAll(): Observable<UserListItemDto[]> {
    return this.http.get<UserListItemDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<UserDetailDto> {
    return this.http.get<UserDetailDto>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateUserRequest): Observable<UserDetailDto> {
    return this.http.post<UserDetailDto>(this.baseUrl, request);
  }

  update(id: number, request: UpdateUserRequest): Observable<UserDetailDto> {
    return this.http.put<UserDetailDto>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
