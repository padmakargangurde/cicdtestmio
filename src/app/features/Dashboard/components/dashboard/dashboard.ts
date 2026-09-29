import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Project } from '../../../Projects/services/project';
import { ProjectListItemDto } from '../../../Projects/models/project.model';
import { ProjectCard } from '../../../Projects/components/project-card/project-card';
import { Icon } from '../../../../shared/icon/icon';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, ProjectCard, Icon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly projectService = inject(Project);

  readonly projects = signal<ProjectListItemDto[]>([]);
  readonly loading = signal(true);

  readonly published = computed(() => this.projects().filter((p) => p.isPublished).length);
  readonly drafts = computed(() => this.projects().length - this.published());

  constructor() {
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  deleteProject(projectId: number): void {
    if (!confirm('Delete this project? This removes all revisions, responses, and audit history. This cannot be undone.')) {
      return;
    }
    this.projectService.delete(projectId).subscribe(() => {
      this.projects.update((list) => list.filter((p) => p.projectId !== projectId));
    });
  }
}
