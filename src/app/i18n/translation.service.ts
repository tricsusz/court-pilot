import { Injectable, signal } from '@angular/core';
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
  private readonly storageKey = 'language';

  readonly language = signal<Language>(this.getInitialLanguage());

  setLanguage(language: Language): void {
    this.language.set(language);
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

    if (stored && stored in translations) {
      return stored as Language;
    }

    const browserLanguage = navigator.language.split('-')[0] as Language;

    if (browserLanguage in translations) {
      return browserLanguage;
    }

    return 'en';
  }
}
