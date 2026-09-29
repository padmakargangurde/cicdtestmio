import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'mep_client_review_identity';

interface StoredIdentity {
  name: string;
  email: string;
  userId: number | null;
}

function loadStoredIdentity(): StoredIdentity {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { name: '', email: '', userId: null };
    const parsed = JSON.parse(raw);
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      userId: typeof parsed.userId === 'number' ? parsed.userId : null,
    };
  } catch {
    return { name: '', email: '', userId: null };
  }
}

/**
 * Holds the reviewer's identity (name, email, and the AppUser id returned by the
 * identify endpoint) across the review/entry/items/summary pages. Persisted to
 * localStorage so a returning reviewer on the same browser doesn't have to
 * re-enter their details — there's still no account/login behind this.
 */
@Injectable({
  providedIn: 'root',
})
export class ClientReviewSession {
  private readonly stored = loadStoredIdentity();

  readonly reviewerName = signal(this.stored.name);
  readonly email = signal(this.stored.email);
  readonly userId = signal<number | null>(this.stored.userId);

  setIdentity(name: string, email: string, userId: number): void {
    this.reviewerName.set(name);
    this.email.set(email);
    this.userId.set(userId);

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, email, userId }));
  }
}
