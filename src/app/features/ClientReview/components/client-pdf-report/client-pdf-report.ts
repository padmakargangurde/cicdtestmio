import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ClientReview } from '../../services/client-review';
import { ApprovalItemDto } from '../../../Revisions/models/revision.model';
import { ClientReviewDto } from '../../models/client-review.model';

interface CategorySummary {
  name: string;
  total: number;
  approved: number;
  pending: number;
  issues: number;
}

@Component({
  selector: 'app-client-pdf-report',
  imports: [],
  templateUrl: './client-pdf-report.html',
  styleUrl: './client-pdf-report.css',
})
export class ClientPdfReport {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly clientReviewService = inject(ClientReview);

  readonly token = this.route.snapshot.paramMap.get('token')!;

  readonly review = signal<ClientReviewDto | null>(null);
  readonly notFound = signal(false);

  readonly items = computed<ApprovalItemDto[]>(() => this.review()?.items ?? []);

  readonly counts = computed(() => {
    const c = { pending: 0, approved: 0, rejected: 0, commented: 0, clarify: 0, na: 0 };
    for (const item of this.items()) {
      switch (item.decision) {
        case 'Pending': c.pending++; break;
        case 'Approved': c.approved++; break;
        case 'Rejected': c.rejected++; break;
        case 'Commented': c.commented++; break;
        case 'Clarify': c.clarify++; break;
        case 'NA': c.na++; break;
      }
    }
    return c;
  });

  readonly categorySummary = computed<CategorySummary[]>(() => {
    const map = new Map<string, CategorySummary>();
    for (const item of this.items()) {
      let stat = map.get(item.categoryName);
      if (!stat) {
        stat = { name: item.categoryName, total: 0, approved: 0, pending: 0, issues: 0 };
        map.set(item.categoryName, stat);
      }
      stat.total++;
      if (item.decision === 'Approved' || item.decision === 'Commented' || item.decision === 'NA') stat.approved++;
      else if (item.decision === 'Pending') stat.pending++;
      else if (item.decision === 'Rejected' || item.decision === 'Clarify') stat.issues++;
    }
    return Array.from(map.values());
  });

  constructor() {
    this.clientReviewService.getByToken(this.token).subscribe({
      next: (review) => this.review.set(review),
      error: () => this.notFound.set(true),
    });
  }

  fieldSummary(item: ApprovalItemDto): string {
    return Object.entries(item.fields)
      .map(([k, v]) => `${k}: ${v || '—'}`)
      .join(' · ');
  }

  formattedDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  goBack(): void {
    this.location.back();
  }

  print(): void {
    window.print();
  }
}
