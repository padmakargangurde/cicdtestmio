import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'review/:token',
    loadComponent: () =>
      import('./features/ClientReview/components/client-entry/client-entry').then((m) => m.ClientEntry),
  },
  {
    path: 'review/:token/items',
    loadComponent: () =>
      import('./features/ClientReview/components/client-review-item/client-review-item').then(
        (m) => m.ClientReviewItem,
      ),
  },
  {
    path: 'review/:token/summary',
    loadComponent: () =>
      import('./features/ClientReview/components/client-summary/client-summary').then((m) => m.ClientSummary),
  },
  {
    path: 'review/:token/report/print',
    loadComponent: () =>
      import('./features/ClientReview/components/client-pdf-report/client-pdf-report').then(
        (m) => m.ClientPdfReport,
      ),
  },
  {
    path: 'projects/:id/reports/print',
    loadComponent: () =>
      import('./features/Projects/components/pdf-report/pdf-report').then((m) => m.PdfReport),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/dashbord/root.route')
        .then(m => m.RouteRoot)
  }
];
