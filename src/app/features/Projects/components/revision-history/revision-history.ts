import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Revision } from '../../../Revisions/services/revision';
import { RevisionListItemDto } from '../../../Revisions/models/revision.model';

@Component({
  selector: 'app-revision-history',
  imports: [],
  templateUrl: './revision-history.html',
  styleUrl: './revision-history.css',
})
export class RevisionHistory {
  private readonly route = inject(ActivatedRoute);
  private readonly revisionService = inject(Revision);

  readonly projectId = Number(this.route.snapshot.paramMap.get('id'));

  readonly revisions = signal<RevisionListItemDto[]>([]);

  constructor() {
    this.loadRevisions();
  }

  private loadRevisions(): void {
    this.revisionService.getAll(this.projectId).subscribe((revisions) => this.revisions.set(revisions));
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
