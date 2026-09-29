import { Component, inject } from '@angular/core';
import { Navbar } from "../../Layouts/navbar/navbar";
import { Sidebar } from "../../Layouts/sidebar/sidebar";
import { Router, RouterOutlet } from '@angular/router';
import { SidebarState } from '../../../shared/sidebar-state/sidebar-state';

@Component({
  selector: 'app-root',
  imports: [Navbar, Sidebar, RouterOutlet],
  templateUrl: './root.html',
  styleUrl: './root.css',
})
export class Root {
  readonly sidebarState = inject(SidebarState);
}
