import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { SettingsService } from '../services/settings-service';
import { InputCustomEvent } from '@ionic/angular';
import { Tab3Page } from './tab3.page';

describe('Tab3Page', () => {
  let component: Tab3Page;
  let fixture: ComponentFixture<Tab3Page>;
  const update = jasmine.createSpy('update').and.resolveTo();

  beforeEach(() => {
    update.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SettingsService,
          useValue: { settings: signal(undefined), update }
        }
      ]
    });
    fixture = TestBed.createComponent(Tab3Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('saves the starting court number as a number', async () => {
    await component.updateStartingCourtNumber({
      detail: { value: '5' }
    } as InputCustomEvent);
    expect(update).toHaveBeenCalledOnceWith({ startingCourtNumber: 5 });
  });
});
