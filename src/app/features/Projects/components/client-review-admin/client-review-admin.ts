import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Icon } from '../../../../shared/icon/icon';
import { ShareLink } from '../../../ShareLinks/services/share-link';
import { ShareLinkDto } from '../../../ShareLinks/models/share-link.model';
import { FinalSubmission } from '../../../FinalSubmission/services/final-submission';
import { FinalSubmissionStatusDto } from '../../../FinalSubmission/models/final-submission.model';

@Component({
  selector: 'app-client-review-admin',
  imports: [Icon],
  templateUrl: './client-review-admin.html',
  styleUrl: './client-review-admin.css',
})
export class ClientReviewAdmin {
  private readonly route = inject(ActivatedRoute);
  private readonly shareLinkService = inject(ShareLink);
  private readonly finalSubmissionService = inject(FinalSubmission);

  readonly projectId = Number(this.route.snapshot.paramMap.get('id'));

  readonly shareLink = signal<ShareLinkDto | null>(null);
  readonly finalStatus = signal<FinalSubmissionStatusDto | null>(null);
  readonly shareLinkBusy = signal(false);
  readonly reopenBusy = signal(false);
  readonly linkCopied = signal(false);

  constructor() {
    this.loadShareLink();
    this.loadFinalStatus();
  }

  private loadShareLink(): void {
    this.shareLinkService.getActive(this.projectId).subscribe({
      next: (link) => this.shareLink.set(link),
      error: () => this.shareLink.set(null),
    });
  }

  generateShareLink(): void {
    this.shareLinkBusy.set(true);
    this.shareLinkService.create(this.projectId).subscribe({
      next: (link) => {
        this.shareLink.set(link);
        this.shareLinkBusy.set(false);
      },
      error: () => this.shareLinkBusy.set(false),
    });
  }

  revokeShareLink(): void {
    this.shareLinkBusy.set(true);
    this.shareLinkService.revoke(this.projectId).subscribe({
      next: () => {
        this.shareLink.set(null);
        this.shareLinkBusy.set(false);
      },
      error: () => this.shareLinkBusy.set(false),
    });
  }

  reviewUrl(token: string): string {
    return `${window.location.origin}/review/${token}`;
  }

  copyLink(): void {
    const link = this.shareLink();
    if (!link) return;
    const url = this.reviewUrl(link.token);

    const markCopied = () => {
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 2000);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(markCopied, () => this.copyLinkFallback(url, markCopied));
    } else {
      this.copyLinkFallback(url, markCopied);
    }
  }

  private copyLinkFallback(text: string, onSuccess: () => void): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      if (document.execCommand('copy')) onSuccess();
    } finally {
      document.body.removeChild(textarea);
    }
  }

  private loadFinalStatus(): void {
    this.finalSubmissionService.getStatus(this.projectId).subscribe((status) => this.finalStatus.set(status));
  }

  reopenSubmission(): void {
    this.reopenBusy.set(true);
    this.finalSubmissionService.reopen(this.projectId).subscribe({
      next: (status) => {
        this.finalStatus.set(status);
        this.reopenBusy.set(false);
      },
      error: () => this.reopenBusy.set(false),
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
