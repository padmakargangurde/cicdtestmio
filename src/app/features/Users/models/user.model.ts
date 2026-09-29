export type UserRole = 'Admin' | 'ProjectManager' | 'BimCoordinator';

export interface UserListItemDto {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface UserDetailDto {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name: string;
  role: UserRole;
  isActive: boolean;
}
