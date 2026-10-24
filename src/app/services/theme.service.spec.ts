import { TestBed } from '@angular/core/testing';
import { ThemePreference, ThemeService } from './theme.service';

describe('ThemeService', () => {
  let deviceTheme: MediaQueryList;
  let deviceThemeChanged: () => void;
  let storedTheme: string | null;

  beforeEach(() => {
    storedTheme = localStorage.getItem('theme');
    localStorage.removeItem('theme');
    deviceTheme = {
      matches: false,
      addEventListener: jasmine
        .createSpy('addEventListener')
        .and.callFake((_type: string, listener: () => void) => {
          deviceThemeChanged = listener;
        }),
      removeEventListener: jasmine.createSpy('removeEventListener')
    } as unknown as MediaQueryList;
    spyOn(window, 'matchMedia').and.returnValue(deviceTheme);
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    if (storedTheme === null) {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', storedTheme);
    }
    document.documentElement.classList.remove('ion-palette-dark');
  });

  function expectDark(dark: boolean): void {
    expect(
      document.documentElement.classList.contains('ion-palette-dark')
    ).toBe(dark);
  }

  it('defaults to the device preference and follows changes', () => {
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('system');
    expectDark(false);
    expect(localStorage.getItem('theme')).toBeNull();
    Object.defineProperty(deviceTheme, 'matches', { value: true });
    deviceThemeChanged();
    expectDark(true);
  });

  for (const theme of ['light', 'dark', 'system'] as ThemePreference[]) {
    it(`persists and restores ${theme} on startup`, () => {
      Object.defineProperty(deviceTheme, 'matches', { value: true });
      TestBed.inject(ThemeService).setTheme(theme);
      expect(localStorage.getItem('theme')).toBe(theme);
      expectDark(theme !== 'light');
      TestBed.resetTestingModule();
      document.documentElement.classList.remove('ion-palette-dark');
      const restarted = TestBed.inject(ThemeService);
      expect(restarted.theme()).toBe(theme);
      expectDark(theme !== 'light');
    });
  }

  it('keeps an explicit selection when the device theme changes', () => {
    const service = TestBed.inject(ThemeService);
    service.setTheme('dark');
    deviceThemeChanged();
    expectDark(true);
    Object.defineProperty(deviceTheme, 'matches', { value: true });
    service.setTheme('light');
    deviceThemeChanged();
    expectDark(false);
    service.setTheme('system');
    expectDark(true);
  });

  it('falls back to the device preference for an invalid stored value', () => {
    localStorage.setItem('theme', 'invalid');
    expect(TestBed.inject(ThemeService).theme()).toBe('system');
  });

  it('removes its device listener on destruction', () => {
    TestBed.inject(ThemeService);
    TestBed.resetTestingModule();
    expect(deviceTheme.removeEventListener).toHaveBeenCalledWith(
      'change',
      deviceThemeChanged
    );
  });
});
