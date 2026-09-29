import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectListItemDto } from '../../models/project.model';
import { Revision } from '../../../Revisions/services/revision';
import { Icon } from '../../../../shared/icon/icon';

@Component({
  selector: 'app-project-card',
  imports: [RouterLink, Icon],
  templateUrl: './project-card.html',
  styleUrl: './project-card.css',
})
export class ProjectCard implements OnInit {
  private readonly revisionService = inject(Revision);

  readonly project = input.required<ProjectListItemDto>();
  readonly targetSection = input<'matrix' | 'client-review' | 'revisions' | 'reports'>('matrix');
  readonly showDelete = input(false);
  readonly deleteRequested = output<number>();

  readonly revisionLabel = signal<string | null>(null);
  readonly total = signal(0);
  readonly percent = signal(0);
  readonly approvedCount = signal(0);
  readonly pendingCount = signal(0);

  ngOnInit(): void {
    const p = this.project();
    if (!p.isPublished) return;

    this.revisionService.getActive(p.projectId).subscribe({
      next: (revision) => {
        this.revisionLabel.set(revision.label);
        let approved = 0;
        let pending = 0;
        for (const item of revision.items) {
          if (item.decision === 'Approved' || item.decision === 'Commented') approved++;
          else if (item.decision === 'Pending') pending++;
        }
        const total = revision.items.length;
        this.total.set(total);
        this.approvedCount.set(approved);
        this.pendingCount.set(pending);
        this.percent.set(total > 0 ? Math.round(((total - pending) / total) * 100) : 0);
      },
      error: () => {},
    });
  }

  formattedDate(value: string | null): string {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.deleteRequested.emit(this.project().projectId);
  }
}
