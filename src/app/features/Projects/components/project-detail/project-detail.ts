import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../services/project';
import { ProjectDetailDto } from '../../models/project.model';
import { User } from '../../../Users/services/user';
import { UserListItemDto } from '../../../Users/models/user.model';
import { Revision } from '../../../Revisions/services/revision';
import { ApprovalItemDto, ReviewDecision, RevisionDetailDto } from '../../../Revisions/models/revision.model';
import { AuditLog } from '../../../AuditLog/services/audit-log';
import { AuditLogEntryDto } from '../../../AuditLog/models/audit-log.model';
import { ShareLink } from '../../../ShareLinks/services/share-link';
import { Icon } from '../../../../shared/icon/icon';
import { ApprovalMatrix, ProjectInfo, ShareLinkSummary } from '../approval-matrix/approval-matrix';

type Tab = 'overview' | 'items' | 'comments' | 'audit';
type DecisionFilter = 'All' | ReviewDecision;

const DECISION_FILTERS: { value: DecisionFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Commented', label: 'Approved with/ Comments' },
  { value: 'Clarify', label: 'Need Clarification' },
  { value: 'NA', label: 'Not Applicable' },
];

const DECISION_LABELS: Record<ReviewDecision, string> = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Commented: 'Approved with/ Comments',
  Clarify: 'Need Clarification',
  NA: 'Not Applicable',
};

const DECISION_ICON: Record<ReviewDecision, string> = {
  Pending: 'clock',
  Approved: 'check',
  Rejected: 'x',
  Commented: 'check',
  Clarify: 'help',
  NA: 'slash',
};

@Component({
  selector: 'app-project-detail',
  imports: [ReactiveFormsModule, Icon, ApprovalMatrix],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(Project);
  private readonly userService = inject(User);
  private readonly revisionService = inject(Revision);
  private readonly auditLogService = inject(AuditLog);
  private readonly shareLinkService = inject(ShareLink);

  readonly projectId = Number(this.route.snapshot.paramMap.get('id'));

  readonly project = signal<ProjectDetailDto | null>(null);
  readonly users = signal<UserListItemDto[]>([]);
  readonly tab = signal<Tab>('overview');

  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly activeRevision = signal<RevisionDetailDto | null>(null);
  readonly shareLinkUrl = signal<ShareLinkSummary | null>(null);
  readonly editingDetails = signal(false);
  readonly deleting = signal(false);
  readonly uploading = signal(false);
  readonly uploadResultMessage = signal<string | null>(null);
  readonly uploadError = signal<string | null>(null);
  readonly exportingExcel = signal(false);

  readonly auditEntries = signal<AuditLogEntryDto[]>([]);

  readonly projectInfo = computed<ProjectInfo | null>(() => {
    const project = this.project();
    if (!project) return null;
    return {
      client: project.clientName,
      location: project.location,
      pmName: project.projectManagerName,
      bimName: project.bimCoordinatorName,
      revisionLabel: this.activeRevision()?.label ?? null,
    };
  });

  readonly categoryFilter = signal<string | null>(null);
  readonly decisionFilter = signal<DecisionFilter>('All');
  readonly itemSearch = signal('');
  readonly decisionFilters = DECISION_FILTERS;

  readonly filteredItems = computed<ApprovalItemDto[]>(() => {
    const revision = this.activeRevision();
    if (!revision) return [];

    const decision = this.decisionFilter();
    const category = this.categoryFilter();
    const search = this.itemSearch().trim().toLowerCase();

    return revision.items.filter((item) => {
      if (decision !== 'All' && item.decision !== decision) return false;
      if (category && item.categoryName !== category) return false;
      if (search) {
        const haystack = [item.categoryName, item.section ?? '', ...Object.values(item.fields)]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  });

  readonly commentedItems = computed<ApprovalItemDto[]>(() => {
    const revision = this.activeRevision();
    if (!revision) return [];
    return revision.items.filter((item) => item.comments.length > 0);
  });

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    clientName: ['', Validators.required],
    clientCompany: [''],
    location: [''],
    projectManagerUserId: [null as number | null],
    bimCoordinatorUserId: [null as number | null],
    dueDate: [''],
    description: [''],
  });

  constructor() {
    this.userService.getAll().subscribe((users) => this.users.set(users));
    this.loadProject();
    this.loadActiveRevision();
    this.loadAuditLog();
    this.loadShareLink();
  }

  selectTab(tab: Tab): void {
    this.tab.set(tab);
  }

  toggleEditDetails(): void {
    this.editingDetails.update((v) => !v);
  }

  deleteProject(): void {
    const project = this.project();
    if (!project) return;
    if (!confirm(`Delete "${project.name}"? This removes all revisions, responses, and audit history. This cannot be undone.`)) {
      return;
    }
    this.deleting.set(true);
    this.projectService.delete(this.projectId).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.deleting.set(false),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading.set(true);
    this.uploadError.set(null);
    this.uploadResultMessage.set(null);

    this.revisionService.upload(this.projectId, file).subscribe({
      next: (result) => {
        this.uploading.set(false);
        let message =
          `${result.label}: ${result.addedCount} added, ${result.modifiedCount} modified, ` +
          `${result.removedCount} removed, ${result.unchangedCount} carried forward.`;
        if (result.warnings.length > 0) {
          message += ' ⚠ ' + result.warnings.join(' ');
        }
        this.uploadResultMessage.set(message);
        this.loadActiveRevision();
        this.loadAuditLog();
        this.loadProject();
      },
      error: (err) => {
        this.uploading.set(false);
        this.uploadError.set(err?.error?.message ?? 'Upload failed.');
      },
      complete: () => {
        input.value = '';
      },
    });
  }

  exportExcel(): void {
    this.exportingExcel.set(true);
    this.revisionService.exportExcel(this.projectId).subscribe({
      next: (blob) => {
        this.exportingExcel.set(false);
        const label = this.activeRevision()?.label?.replace(/\s+/g, '') ?? 'Revision';
        const number = this.project()?.projectNumber ?? 'Approval';
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
    this.router.navigate(['/projects', this.projectId, 'reports', 'print']);
  }

  private loadShareLink(): void {
    this.shareLinkService.getActive(this.projectId).subscribe({
      next: (link) =>
        this.shareLinkUrl.set(
          link.isRevoked ? null : { url: `${window.location.origin}/review/${link.token}`, createdAt: link.createdAt },
        ),
      error: () => this.shareLinkUrl.set(null),
    });
  }

  jumpToCategory(categoryName: string): void {
    this.categoryFilter.set(categoryName);
    this.selectTab('items');
  }

  clearCategoryFilter(): void {
    this.categoryFilter.set(null);
  }

  onItemSearch(event: Event): void {
    this.itemSearch.set((event.target as HTMLInputElement).value);
  }

  pad(itemNo: number): string {
    return String(itemNo).padStart(3, '0');
  }

  private loadProject(): void {
    this.projectService.getById(this.projectId).subscribe((project) => {
      this.project.set(project);
      this.form.patchValue({
        name: project.name,
        clientName: project.clientName,
        clientCompany: project.clientCompany ?? '',
        location: project.location ?? '',
        projectManagerUserId: project.projectManagerUserId,
        bimCoordinatorUserId: project.bimCoordinatorUserId,
        dueDate: project.dueDate ?? '',
        description: project.description ?? '',
      });
    });
  }

  saveOverview(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);
    const value = this.form.getRawValue();

    this.projectService
      .update(this.projectId, {
        name: value.name,
        clientName: value.clientName,
        clientCompany: value.clientCompany || null,
        location: value.location || null,
        projectManagerUserId: value.projectManagerUserId,
        bimCoordinatorUserId: value.bimCoordinatorUserId,
        dueDate: value.dueDate || null,
        description: value.description || null,
      })
      .subscribe({
        next: (project) => {
          this.project.set(project);
          this.saving.set(false);
        },
        error: (err) => {
          this.saving.set(false);
          this.saveError.set(err?.error?.message ?? 'Could not save changes.');
        },
      });
  }

  private loadActiveRevision(): void {
    this.revisionService.getActive(this.projectId).subscribe({
      next: (revision) => this.activeRevision.set(revision),
      error: () => this.activeRevision.set(null),
    });
  }

  private loadAuditLog(): void {
    this.auditLogService.getForProject(this.projectId).subscribe((entries) => this.auditEntries.set(entries));
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

  commentInitials(name: string | null): string {
    const trimmed = (name ?? 'Client').trim();
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    const first = parts[0][0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
    return (first + last).toUpperCase();
  }

  fieldEntries(fields: Record<string, string | null>): [string, string | null][] {
    return Object.entries(fields);
  }

  previewFields(fields: Record<string, string | null>): [string, string | null][] {
    return Object.entries(fields).slice(0, 3);
  }

  badgeClass(decision: string): string {
    return decision === 'NA' ? 'na' : decision.toLowerCase();
  }

  decisionLabel(decision: ReviewDecision): string {
    return DECISION_LABELS[decision];
  }

  decisionIcon(decision: ReviewDecision): string {
    return DECISION_ICON[decision];
  }
}
