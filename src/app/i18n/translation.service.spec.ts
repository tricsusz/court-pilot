import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
import { TranslatePipe } from './translation.pipe';
import { FullnamePipe } from '../fullname-pipe';

describe('TranslationService', () => {
  let stored: string | null;
  let documentLanguage: string;
  beforeEach(() => {
    documentLanguage = document.documentElement.lang;
    stored = localStorage.getItem('language');
    localStorage.setItem('language', 'en');
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    document.documentElement.lang = documentLanguage;
    if (stored === null) localStorage.removeItem('language');
    else localStorage.setItem('language', stored);
  });

  it('ignores inherited object keys in saved language values', () => {
    localStorage.setItem('language', 'toString');
    const service = TestBed.inject(TranslationService);
    expect(['en', 'hu']).toContain(service.language());
    expect(typeof service.translate('court')).toBe('string');
  });

  it('updates translations and name order when the language changes', () => {
    const service = TestBed.inject(TranslationService);
    const translate = TestBed.runInInjectionContext(() => new TranslatePipe());
    const fullname = TestBed.runInInjectionContext(() => new FullnamePipe());
    const official = {
      id: 1,
      firstName: 'Alex',
      lastName: 'Smith',
      country: 'GB',
      gender: 'M'
    };
    expect(translate.transform('court')).toBe('Court');
    expect(fullname.transform(official)).toBe('Alex Smith');
    service.setLanguage('hu');
    expect(translate.transform('court')).toBe('Pálya');
    expect(fullname.transform(official)).toBe('Smith Alex');
    expect(localStorage.getItem('language')).toBe('hu');
    expect(document.documentElement.lang).toBe('hu');
  });
});
