import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectContext {
  private readonly router = inject(Router);

  readonly projectId = signal<number | null>(null);

  constructor() {
    this.updateFromUrl(this.router.url);
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event) => {
      this.updateFromUrl(event.urlAfterRedirects);
    });
  }

  private updateFromUrl(url: string): void {
    const match = url.match(/^\/projects\/(\d+)/);
    this.projectId.set(match ? Number(match[1]) : null);
  }
}
