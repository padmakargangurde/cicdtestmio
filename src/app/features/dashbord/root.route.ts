import { Routes } from '@angular/router';
import { Root } from './root/root';

export const RouteRoot: Routes = [
  {
    path: '',
    component: Root,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../Dashboard/components/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'projects/new',
        loadComponent: () =>
          import('../Projects/components/project-form/project-form').then((m) => m.ProjectForm),
      },
      { path: 'projects/:id', pathMatch: 'full', redirectTo: 'projects/:id/matrix' },
      {
        path: 'projects/:id/matrix',
        loadComponent: () =>
          import('../Projects/components/project-detail/project-detail').then((m) => m.ProjectDetail),
      },
      {
        path: 'projects/:id/revisions',
        loadComponent: () =>
          import('../Projects/components/revision-history/revision-history').then((m) => m.RevisionHistory),
      },
      {
        path: 'projects/:id/reports',
        loadComponent: () =>
          import('../Projects/components/reports/reports').then((m) => m.Reports),
      },
      {
        path: 'projects/:id/client-review',
        loadComponent: () =>
          import('../Projects/components/client-review-admin/client-review-admin').then(
            (m) => m.ClientReviewAdmin,
          ),
      },
      {
        path: 'matrix',
        loadComponent: () =>
          import('../Projects/components/project-picker/project-picker').then((m) => m.ProjectPicker),
        data: { section: 'matrix', title: 'Approval Matrix' },
      },
      {
        path: 'client-review',
        loadComponent: () =>
          import('../Projects/components/project-picker/project-picker').then((m) => m.ProjectPicker),
        data: { section: 'client-review', title: 'Client Review' },
      },
      {
        path: 'revisions',
        loadComponent: () =>
          import('../Projects/components/project-picker/project-picker').then((m) => m.ProjectPicker),
        data: { section: 'revisions', title: 'Revision History' },
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('../Projects/components/project-picker/project-picker').then((m) => m.ProjectPicker),
        data: { section: 'reports', title: 'Reports' },
      },
      {
        path: 'users',
        loadComponent: () =>
          import('../Users/components/user-list/user-list').then((m) => m.UserList),
      },
    ],
  },
];
