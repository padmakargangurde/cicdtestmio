import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project } from '../../services/project';
import { ProjectListItemDto } from '../../models/project.model';
import { ProjectCard } from '../project-card/project-card';

type TargetSection = 'matrix' | 'client-review' | 'revisions' | 'reports';

@Component({
  selector: 'app-project-picker',
  imports: [ProjectCard],
  templateUrl: './project-picker.html',
  styleUrl: './project-picker.css',
})
export class ProjectPicker {
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(Project);

  readonly section = this.route.snapshot.data['section'] as TargetSection;
  readonly title = this.route.snapshot.data['title'] as string;

  readonly projects = signal<ProjectListItemDto[]>([]);

  constructor() {
    this.projectService.getAll().subscribe((projects) => this.projects.set(projects));
  }
}
