import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import {
  translations,
  Language,
  TranslationKey,
  TranslationParams
} from './translations';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'language';

  private readonly selectedLanguage = signal<Language>(
    this.getInitialLanguage()
  );
  readonly language = this.selectedLanguage.asReadonly();

  constructor() {
    this.document.documentElement.lang = this.language();
  }

  setLanguage(language: Language): void {
    this.selectedLanguage.set(language);
    this.document.documentElement.lang = language;
    localStorage.setItem(this.storageKey, language);
  }

  translate(key: TranslationKey, params: TranslationParams = {}): string {
    let text: string = translations[this.language()][key];

    for (const [param, value] of Object.entries(params)) {
      text = text.replaceAll(`{${param}}`, String(value));
    }

    return text;
  }

  private getInitialLanguage(): Language {
    const stored = localStorage.getItem(this.storageKey);

    if (stored === 'en' || stored === 'hu') {
      return stored;
    }

    const browserLanguage = navigator.language.split('-')[0];

    if (browserLanguage === 'en' || browserLanguage === 'hu') {
      return browserLanguage;
    }

    return 'en';
  }
}
