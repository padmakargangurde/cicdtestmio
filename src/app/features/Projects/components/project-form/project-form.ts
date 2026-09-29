import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Project } from '../../services/project';
import { User } from '../../../Users/services/user';
import { UserListItemDto } from '../../../Users/models/user.model';

@Component({
  selector: 'app-project-form',
  imports: [ReactiveFormsModule],
  templateUrl: './project-form.html',
  styleUrl: './project-form.css',
})
export class ProjectForm {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(Project);
  private readonly userService = inject(User);
  private readonly router = inject(Router);

  readonly users = signal<UserListItemDto[]>([]);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    projectNumber: ['', Validators.required],
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
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    const value = this.form.getRawValue();

    this.projectService
      .create({
        projectNumber: value.projectNumber,
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
        next: (project) => this.router.navigate(['/projects', project.projectId, 'matrix']),
        error: (err) => {
          this.saving.set(false);
          this.error.set(err?.error?.message ?? 'Could not create the project.');
        },
      });
  }
}
