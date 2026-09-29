import { Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApprovalItemDto, CategoryDto, ReviewDecision } from '../../../Revisions/models/revision.model';
import { Icon } from '../../../../shared/icon/icon';

interface DecisionCounts {
  pending: number;
  approved: number;
  rejected: number;
  commented: number;
  clarify: number;
  na: number;
}

interface CategoryStat {
  name: string;
  total: number;
  approved: number;
  pending: number;
  issues: number;
}

const DECISION_ICON: Record<ReviewDecision, string> = {
  Pending: 'clock',
  Approved: 'check',
  Rejected: 'x',
  Commented: 'check',
  Clarify: 'help',
  NA: 'slash',
};

function emptyCounts(): DecisionCounts {
  return { pending: 0, approved: 0, rejected: 0, commented: 0, clarify: 0, na: 0 };
}

export interface ProjectInfo {
  client: string;
  location: string | null;
  pmName: string | null;
  bimName: string | null;
  revisionLabel: string | null;
}

export interface ShareLinkSummary {
  url: string;
  createdAt: string;
}

@Component({
  selector: 'app-approval-matrix',
  imports: [Icon, RouterLink],
  templateUrl: './approval-matrix.html',
  styleUrl: './approval-matrix.css',
})
export class ApprovalMatrix {
  readonly items = input.required<ApprovalItemDto[]>();
  readonly categories = input.required<CategoryDto[]>();
  readonly projectId = input.required<number>();
  readonly projectInfo = input<ProjectInfo | null>(null);
  readonly shareLink = input<ShareLinkSummary | null>(null);

  readonly categoryClick = output<string>();
  readonly editProjectInfo = output<void>();

  readonly decisionIcon = DECISION_ICON;
  readonly linkCopied = signal(false);

  copyLink(): void {
    const link = this.shareLink();
    if (!link) return;

    const markCopied = () => {
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 2000);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link.url).then(markCopied, () => this.copyLinkFallback(link.url, markCopied));
    } else {
      this.copyLinkFallback(link.url, markCopied);
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

  readonly counts = computed<DecisionCounts>(() => {
    const counts = emptyCounts();
    for (const item of this.items()) {
      switch (item.decision) {
        case 'Pending': counts.pending++; break;
        case 'Approved': counts.approved++; break;
        case 'Rejected': counts.rejected++; break;
        case 'Commented': counts.commented++; break;
        case 'Clarify': counts.clarify++; break;
        case 'NA': counts.na++; break;
      }
    }
    return counts;
  });

  readonly total = computed(() => this.items().length);
  readonly done = computed(() => this.total() - this.counts().pending);
  readonly percent = computed(() => (this.total() > 0 ? Math.round((this.done() / this.total()) * 100) : 0));
  readonly issues = computed(() => this.counts().rejected + this.counts().clarify);
  readonly approvedTotal = computed(() => this.counts().approved + this.counts().commented);

  readonly categoryStats = computed<CategoryStat[]>(() => {
    const map = new Map<string, CategoryStat>();
    for (const category of this.categories()) {
      map.set(category.name, { name: category.name, total: 0, approved: 0, pending: 0, issues: 0 });
    }
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
}
