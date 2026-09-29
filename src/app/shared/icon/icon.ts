import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/** Hand-authored inline SVG paths, ported from the mep-approval-platform prototype's icon set. */
const ICON_PATHS: Record<string, string> = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  matrix: '<path d="M9 11l3 3 6-6"/><rect x="3" y="3" width="18" height="18" rx="2.5"/>',
  review: '<path d="M8 9h8M8 13h5"/><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M8 20v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  revisions: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v4h4"/><path d="M12 8v4l3 2"/>',
  reports: '<path d="M4 20V10M12 20V4M20 20v-7"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 20h16"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  help: '<path d="M9.1 9a2.9 2.9 0 1 1 3.9 2.7c-.9.4-1.5 1.2-1.5 2.3v.5"/><path d="M12 17.5h.01"/><circle cx="12" cy="12" r="9"/>',
  slash: '<circle cx="12" cy="12" r="9"/><path d="M6 6l12 12"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7m2 0v13a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 7 20V7h10z"/>',
  link: '<path d="M9.5 14.5l5-5"/><path d="M8 17.5l-1.5 1.5a3.5 3.5 0 0 1-5-5l3-3a3.5 3.5 0 0 1 5-.1"/><path d="M16 6.5l1.5-1.5a3.5 3.5 0 0 1 5 5l-3 3a3.5 3.5 0 0 1-5 .1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  alert: '<path d="M10.6 4.2a1.6 1.6 0 0 1 2.8 0l8.4 14.6a1.6 1.6 0 0 1-1.4 2.4H3.6a1.6 1.6 0 0 1-1.4-2.4L10.6 4.2z"/><path d="M12 9.5v4.2M12 17h.01"/>',
  file: '<path d="M14 3H6a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 6 21h12a1.5 1.5 0 0 0 1.5-1.5V8.5L14 3z"/><path d="M14 3v5.5h5.5"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.6"/><path d="M15.8 13.5A5.5 5.5 0 0 1 21.5 19"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .35 1.9l.06.06a2.1 2.1 0 1 1-3 3l-.07-.07a1.7 1.7 0 0 0-1.9-.35 1.7 1.7 0 0 0-1 1.55V20a2.1 2.1 0 0 1-4.2 0v-.1a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.9.35l-.07.07a2.1 2.1 0 1 1-3-3l.06-.06a1.7 1.7 0 0 0 .35-1.9 1.7 1.7 0 0 0-1.55-1H4a2.1 2.1 0 0 1 0-4.2h.1a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.35-1.9l-.06-.07a2.1 2.1 0 1 1 3-3l.07.06a1.7 1.7 0 0 0 1.9.35H10a1.7 1.7 0 0 0 1-1.55V4a2.1 2.1 0 0 1 4.2 0v.1a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.9-.35l.07-.06a2.1 2.1 0 1 1 3 3l-.06.07a1.7 1.7 0 0 0-.35 1.9V10a1.7 1.7 0 0 0 1.55 1H20a2.1 2.1 0 0 1 0 4.2h-.1a1.7 1.7 0 0 0-1.55 1z"/>',
  chevronDown: '<path d="M6 9l6 6 6-6"/>',
  folder: '<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4.4a1.5 1.5 0 0 1 1.2.6l1 1.4a1.5 1.5 0 0 0 1.2.6H19.5A1.5 1.5 0 0 1 21 10v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18v-10.5z"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="1.5"/><path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"/>',
};

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.css',
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  private readonly sanitizer = inject(DomSanitizer);

  readonly svgPaths = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(ICON_PATHS[this.name()] ?? ICON_PATHS['help']),
  );
}
