import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientReview } from '../../services/client-review';
import { ClientReviewSession } from '../../services/client-review-session';
import { ClientReviewDto } from '../../models/client-review.model';

@Component({
  selector: 'app-client-summary',
  imports: [FormsModule, RouterLink],
  templateUrl: './client-summary.html',
  styleUrl: './client-summary.css',
})
export class ClientSummary {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientReviewService = inject(ClientReview);
  private readonly session = inject(ClientReviewSession);

  readonly token = this.route.snapshot.paramMap.get('token')!;

  readonly review = signal<ClientReviewDto | null>(null);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  name = '';
  company = '';

  constructor() {
    this.name = this.session.reviewerName();
    this.load();
  }

  private load(): void {
    this.clientReviewService.getByToken(this.token).subscribe({
      next: (review) => {
        this.review.set(review);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  submit(): void {
    const name = this.name.trim();
    if (!name) return;

    this.submitting.set(true);
    this.error.set(null);

    this.clientReviewService
      .submitFinal(this.token, { submittedByName: name, submittedByCompany: this.company.trim() || null })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.load();
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? 'Could not submit the final approval.');
        },
      });
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
