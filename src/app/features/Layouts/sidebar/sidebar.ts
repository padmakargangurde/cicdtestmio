import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../../../shared/icon/icon';
import { ProjectContext } from '../../../shared/project-context/project-context';
import { SidebarState } from '../../../shared/sidebar-state/sidebar-state';

type Section = 'matrix' | 'client-review' | 'revisions' | 'reports';

@Component({
  selector: 'sidebar',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private readonly context = inject(ProjectContext);
  readonly sidebarState = inject(SidebarState);
  readonly projectId = this.context.projectId;

  linkFor(section: Section): (string | number)[] {
    const id = this.projectId();
    return id ? ['/projects', id, section] : ['/', section];
  }
}
