import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApprovalItemDto, ReviewDecision } from '../../../Revisions/models/revision.model';
import { ClientReview } from '../../services/client-review';
import { ClientReviewSession } from '../../services/client-review-session';
import { ClientReviewDto } from '../../models/client-review.model';
import { Icon } from '../../../../shared/icon/icon';

interface DecisionOption {
  key: ReviewDecision;
  icon: string;
  label: string;
  cls: string;
}

const DECISIONS: DecisionOption[] = [
  { key: 'Approved', icon: 'check', label: 'Approve', cls: 'approve' },
  { key: 'Commented', icon: 'check', label: 'Approve w/ Comments', cls: 'comment' },
  { key: 'Rejected', icon: 'x', label: 'Reject', cls: 'reject' },
  { key: 'NA', icon: 'slash', label: 'Not Applicable', cls: 'na' },
];

const REQUIRE_COMMENT: Partial<Record<ReviewDecision, boolean>> = {
  Rejected: true,
  Commented: true,
};

@Component({
  selector: 'app-client-review-item',
  imports: [FormsModule, Icon],
  templateUrl: './client-review-item.html',
  styleUrl: './client-review-item.css',
})
export class ClientReviewItem {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clientReviewService = inject(ClientReview);
  private readonly session = inject(ClientReviewSession);

  readonly token = this.route.snapshot.paramMap.get('token')!;
  readonly decisions = DECISIONS;

  readonly review = signal<ClientReviewDto | null>(null);
  readonly loading = signal(true);
  readonly index = signal(0);

  readonly currentDecision = signal<ReviewDecision | null>(null);
  readonly comment = signal('');
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly items = computed<ApprovalItemDto[]>(() =>
    (this.review()?.items ?? []).filter((i) => i.changeType !== 'Removed'),
  );

  readonly currentItem = computed<ApprovalItemDto | null>(() => this.items()[this.index()] ?? null);

  readonly requiresComment = computed(() => {
    const decision = this.currentDecision();
    return decision != null && !!REQUIRE_COMMENT[decision];
  });

  readonly canAdvance = computed(() => {
    const decision = this.currentDecision();
    if (!decision) return false;
    return !this.requiresComment() || this.comment().trim().length > 0;
  });

  readonly reviewedCount = computed(() => this.items().filter((i) => i.decision !== 'Pending').length);
  readonly percent = computed(() =>
    this.items().length ? Math.round((this.index() / this.items().length) * 100) : 0,
  );

  readonly categoryProgress = computed(() => {
    const item = this.currentItem();
    if (!item) return null;
    const inCategory = this.items().filter((i) => i.categoryName === item.categoryName);
    return {
      position: inCategory.indexOf(item) + 1,
      total: inCategory.length,
      done: inCategory.filter((i) => i.decision !== 'Pending').length,
    };
  });

  readonly question = computed(() => {
    const item = this.currentItem();
    if (!item) return '';
    return this.generateQuestion(item);
  });

  readonly remarkField = computed(() => {
    const item = this.currentItem();
    if (!item) return null;
    const entry = Object.entries(item.fields).find(([k]) => /REMARK/i.test(k));
    return entry && entry[1] ? entry[1] : null;
  });

  readonly showSection = computed(() => {
    const item = this.currentItem();
    if (!item?.section) return false;
    const norm = item.section.trim().toLowerCase();
    return !Object.values(item.fields).some((v) => (v ?? '').trim().toLowerCase() === norm);
  });

  constructor() {
    this.clientReviewService.getByToken(this.token).subscribe({
      next: (review) => {
        if (review.finalStatus.isLocked) {
          this.router.navigate(['/review', this.token]);
          return;
        }
        this.review.set(review);
        this.loading.set(false);
        this.index.set(this.firstUnansweredIndex());
        this.loadCurrentIntoForm();
      },
      error: () => this.router.navigate(['/review', this.token]),
    });
  }

  private firstUnansweredIndex(): number {
    const items = (this.review()?.items ?? []).filter((i) => i.changeType !== 'Removed');
    const idx = items.findIndex((i) => i.decision === 'Pending');
    return idx === -1 ? 0 : idx;
  }

  private loadCurrentIntoForm(): void {
    const item = this.currentItem();
    this.currentDecision.set(item && item.decision !== 'Pending' ? item.decision : null);
    this.comment.set('');
    this.saveError.set(null);
  }

  selectDecision(decision: ReviewDecision): void {
    this.currentDecision.set(decision);
  }

  fieldEntries(item: ApprovalItemDto): [string, string | null][] {
    return Object.entries(item.fields);
  }

  commentInitials(name: string | null): string {
    const trimmed = (name ?? 'Client').trim();
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    const first = parts[0][0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
    return (first + last).toUpperCase();
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

  next(): void {
    const decision = this.currentDecision();
    const item = this.currentItem();
    if (!item || !decision || !this.canAdvance()) return;

    this.saving.set(true);
    this.saveError.set(null);

    this.clientReviewService
      .submitResponse(this.token, item.itemIdentityId, {
        decision,
        comment: this.comment().trim() || null,
        reviewedByName: this.session.reviewerName(),
        userId: this.session.userId(),
        email: this.session.email(),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          if (this.index() + 1 >= this.items().length) {
            this.router.navigate(['/review', this.token, 'summary']);
          } else {
            this.index.set(this.index() + 1);
            this.loadCurrentIntoForm();
          }
        },
        error: (err) => {
          this.saving.set(false);
          this.saveError.set(err?.error?.message ?? 'Could not save this response.');
        },
      });
  }

  previous(): void {
    if (this.index() === 0) return;
    this.index.set(this.index() - 1);
    this.loadCurrentIntoForm();
  }

  private generateQuestion(item: ApprovalItemDto): string {
    const cols = Object.keys(item.fields).map((c) => c.toUpperCase());
    const has = (kw: string) => cols.some((c) => c.includes(kw));

    if ((item.sourceStatus ?? '').toUpperCase().includes('PLEASE PROVIDE DETAILS')) {
      return 'Please provide the required details for this item.';
    }
    if (has('INSULATION') && has('THICKNESS')) {
      return 'Please confirm the insulation material and thickness shown below are acceptable.';
    }
    if (has('DUCT') && has('LINER')) {
      return 'Please provide/confirm the duct liner requirement for this item.';
    }
    if (has('WATER GAUGE') || has('SEAL CLASS')) {
      return 'Please confirm the duct seal class and water gauge requirement.';
    }
    if (has('PIPE SIZE') && has('MATERIAL')) {
      return 'Please confirm whether the proposed material and fitting are acceptable for this application.';
    }
    if (has('MATERIAL')) {
      return 'Please confirm the proposed material shown below.';
    }
    return 'Please confirm whether this requirement is acceptable.';
  }
}
