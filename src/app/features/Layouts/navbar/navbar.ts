import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { SidebarState } from '../../../shared/sidebar-state/sidebar-state';

@Component({
  selector: 'navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);
  readonly sidebarState = inject(SidebarState);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly title = computed(() => {
    const segments = this.url().split('/').filter(Boolean);
    if (segments.length === 0 || segments[0] === 'dashboard') return 'Dashboard';
    if (segments[0] === 'users') return 'Team';
    if (segments[0] === 'projects' && segments[1] === 'new') return 'New Project';
    if (segments[0] === 'projects') return 'Project';
    return 'MEP Approval Hub';
  });

  readonly crumb = computed(() => `MEP-HUB / ${this.title().toUpperCase()}`);
}
