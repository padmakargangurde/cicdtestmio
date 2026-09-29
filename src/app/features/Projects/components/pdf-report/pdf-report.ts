import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Project } from '../../services/project';
import { ProjectDetailDto } from '../../models/project.model';
import { Revision } from '../../../Revisions/services/revision';
import { ApprovalItemDto, RevisionDetailDto } from '../../../Revisions/models/revision.model';

interface CategorySummary {
  name: string;
  total: number;
  approved: number;
  pending: number;
  issues: number;
}

@Component({
  selector: 'app-pdf-report',
  imports: [],
  templateUrl: './pdf-report.html',
  styleUrl: './pdf-report.css',
})
export class PdfReport {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly projectService = inject(Project);
  private readonly revisionService = inject(Revision);

  readonly projectId = Number(this.route.snapshot.paramMap.get('id'));

  readonly project = signal<ProjectDetailDto | null>(null);
  readonly revision = signal<RevisionDetailDto | null>(null);

  readonly items = computed<ApprovalItemDto[]>(() => this.revision()?.items ?? []);

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
    this.projectService.getById(this.projectId).subscribe((project) => this.project.set(project));
    this.revisionService.getActive(this.projectId).subscribe({
      next: (revision) => this.revision.set(revision),
      error: () => this.revision.set(null),
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
