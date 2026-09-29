import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientReview } from '../../services/client-review';
import { ClientReviewSession } from '../../services/client-review-session';
import { ClientReviewDto } from '../../models/client-review.model';
import { Icon } from '../../../../shared/icon/icon';

@Component({
  selector: 'app-client-entry',
  imports: [FormsModule, DecimalPipe, Icon],
  templateUrl: './client-entry.html',
  styleUrl: './client-entry.css',
})
export class ClientEntry {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientReviewService = inject(ClientReview);
  private readonly session = inject(ClientReviewSession);

  readonly token = this.route.snapshot.paramMap.get('token')!;

  readonly review = signal<ClientReviewDto | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly exportingExcel = signal(false);

  reviewerName = '';
  reviewerEmail = '';
  readonly identifying = signal(false);
  readonly identifyError = signal<string | null>(null);

  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor() {
    this.reviewerName = this.session.reviewerName();
    this.reviewerEmail = this.session.email();
    this.clientReviewService.getByToken(this.token).subscribe({
      next: (review) => {
        this.review.set(review);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  get canStartReview(): boolean {
    return !!this.reviewerName.trim() && this.emailPattern.test(this.reviewerEmail.trim());
  }

  startReview(): void {
    const name = this.reviewerName.trim();
    const email = this.reviewerEmail.trim().toLowerCase();
    if (!this.canStartReview) return;

    this.identifying.set(true);
    this.identifyError.set(null);

    this.clientReviewService.identify(this.token, { name, email }).subscribe({
      next: (result) => {
        this.session.setIdentity(result.name, result.email, result.userId);
        this.identifying.set(false);
        this.router.navigate(['/review', this.token, 'items']);
      },
      error: (err) => {
        this.identifying.set(false);
        this.identifyError.set(err?.error?.message ?? 'Could not start the review. Please try again.');
      },
    });
  }

  exportExcel(): void {
    this.exportingExcel.set(true);
    this.clientReviewService.exportExcel(this.token).subscribe({
      next: (blob) => {
        this.exportingExcel.set(false);
        const label = this.review()?.revisionLabel?.replace(/\s+/g, '') ?? 'Revision';
        const number = this.review()?.projectNumber ?? 'Approval';
        const fileName = `${number}_${label}_Approval.xlsx`;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.exportingExcel.set(false),
    });
  }

  openPdfReport(): void {
    this.router.navigate(['/review', this.token, 'report', 'print']);
  }

  formattedDateTime(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
