import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { SettingsService } from '../services/settings-service';
import { Tab3Page } from './tab3.page';

describe('Tab3Page', () => {
  let component: Tab3Page;
  let fixture: ComponentFixture<Tab3Page>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: SettingsService, useValue: { settings: signal(undefined) } }
      ]
    });
    fixture = TestBed.createComponent(Tab3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
