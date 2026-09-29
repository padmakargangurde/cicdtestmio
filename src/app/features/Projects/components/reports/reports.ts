import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Revision } from '../../../Revisions/services/revision';
import { RevisionDetailDto } from '../../../Revisions/models/revision.model';
import { Project } from '../../services/project';
import { ProjectDetailDto } from '../../models/project.model';
import { Icon } from '../../../../shared/icon/icon';
import { ApprovalMatrix } from '../approval-matrix/approval-matrix';

@Component({
  selector: 'app-reports',
  imports: [Icon, ApprovalMatrix],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly revisionService = inject(Revision);
  private readonly projectService = inject(Project);

  readonly projectId = Number(this.route.snapshot.paramMap.get('id'));
  readonly project = signal<ProjectDetailDto | null>(null);
  readonly activeRevision = signal<RevisionDetailDto | null>(null);
  readonly exporting = signal(false);

  constructor() {
    this.projectService.getById(this.projectId).subscribe((project) => this.project.set(project));
    this.revisionService.getActive(this.projectId).subscribe({
      next: (revision) => this.activeRevision.set(revision),
      error: () => this.activeRevision.set(null),
    });
  }

  exportExcel(): void {
    this.exporting.set(true);
    this.revisionService.exportExcel(this.projectId).subscribe({
      next: (blob) => {
        this.exporting.set(false);
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
      error: () => this.exporting.set(false),
    });
  }

  openPdfReport(): void {
    this.router.navigate(['/projects', this.projectId, 'reports', 'print']);
  }
}
