import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { User } from '../../services/user';
import { UserListItemDto, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  imports: [ReactiveFormsModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(User);

  readonly users = signal<UserListItemDto[]>([]);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly roles: UserRole[] = ['Admin', 'ProjectManager', 'BimCoordinator'];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['ProjectManager' as UserRole, Validators.required],
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.userService.getAll().subscribe((users) => this.users.set(users));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.userService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset({ name: '', email: '', role: 'ProjectManager' });
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? 'Could not create the user.');
      },
    });
  }

  roleLabel(role: UserRole): string {
    switch (role) {
      case 'ProjectManager':
        return 'Project Manager';
      case 'BimCoordinator':
        return 'BIM Coordinator';
      default:
        return role;
    }
  }
}
