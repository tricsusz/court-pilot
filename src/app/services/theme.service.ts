import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storageKey = 'theme';
  private readonly deviceTheme = window.matchMedia(
    '(prefers-color-scheme: dark)'
  );
  private readonly preference = signal<ThemePreference>(this.getInitialTheme());

  readonly theme = this.preference.asReadonly();

  constructor() {
    this.applyTheme();
    const onDeviceThemeChange = (): void => this.applyTheme();
    this.deviceTheme.addEventListener('change', onDeviceThemeChange);
    this.destroyRef.onDestroy(() => {
      this.deviceTheme.removeEventListener('change', onDeviceThemeChange);
    });
  }

  setTheme(theme: ThemePreference): void {
    this.preference.set(theme);
    localStorage.setItem(this.storageKey, theme);
    this.applyTheme();
  }

  private getInitialTheme(): ThemePreference {
    const stored = localStorage.getItem(this.storageKey);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  }

  private applyTheme(): void {
    const theme = this.preference();
    const dark =
      theme === 'dark' || (theme === 'system' && this.deviceTheme.matches);
    this.document.documentElement.classList.toggle('ion-palette-dark', dark);
  }
}
