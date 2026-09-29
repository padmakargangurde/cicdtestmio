export interface ProjectListItemDto {
  projectId: number;
  projectNumber: string;
  name: string;
  clientName: string;
  dueDate: string | null;
  isPublished: boolean;
  createdAt: string;
}

export interface ProjectDetailDto {
  projectId: number;
  projectNumber: string;
  name: string;
  clientName: string;
  clientCompany: string | null;
  location: string | null;
  projectManagerUserId: number | null;
  projectManagerName: string | null;
  bimCoordinatorUserId: number | null;
  bimCoordinatorName: string | null;
  dueDate: string | null;
  description: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateProjectRequest {
  projectNumber: string;
  name: string;
  clientName: string;
  clientCompany?: string | null;
  location?: string | null;
  projectManagerUserId?: number | null;
  bimCoordinatorUserId?: number | null;
  dueDate?: string | null;
  description?: string | null;
}

export interface UpdateProjectRequest {
  name: string;
  clientName: string;
  clientCompany?: string | null;
  location?: string | null;
  projectManagerUserId?: number | null;
  bimCoordinatorUserId?: number | null;
  dueDate?: string | null;
  description?: string | null;
}
