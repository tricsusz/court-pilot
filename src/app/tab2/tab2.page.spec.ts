import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { UmpireService } from '../services/umpire.service';
import { Tab2Page } from './tab2.page';

describe('Tab2Page', () => {
  let component: Tab2Page;
  let fixture: ComponentFixture<Tab2Page>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: UmpireService,
          useValue: { umpires: signal([]), create: async () => 1 }
        }
      ]
    });
    fixture = TestBed.createComponent(Tab2Page);
    component = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => fixture.nativeElement.remove());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('rejects whitespace-only names', async () => {
    component.lastName = '   ';
    component.firstName = 'Alex';
    expect(component.isValidUmpire()).toBeFalse();
    const dismiss = spyOn(component.modal, 'dismiss');
    await component.confirm();
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('keeps the form open and preserves the draft when saving fails', async () => {
    component.lastName = 'Smith';
    component.firstName = 'Alex';
    spyOn(component.umpireService, 'create').and.callFake(
      () =>
        new Promise<number>((_resolve, reject) => {
          setTimeout(() => reject(new Error('write failed')), 0);
        })
    );
    const present = jasmine.createSpy('present').and.resolveTo();
    spyOn(component.alertController, 'create').and.resolveTo({
      present
    } as unknown as HTMLIonAlertElement);
    spyOn(console, 'error');
    const dismiss = spyOn(component.modal, 'dismiss');
    await component.confirm();
    expect(present).toHaveBeenCalled();
    expect(dismiss).not.toHaveBeenCalled();
    expect(component.firstName).toBe('Alex');
    expect(component.saving).toBeFalse();
  });

  it('persists trimmed names before closing and prevents repeated saves', async () => {
    component.lastName = ' Smith ';
    component.firstName = ' Alex ';
    component.country = ' GB ';
    const create = spyOn(component.umpireService, 'create').and.resolveTo(1);
    const dismiss = spyOn(component.modal, 'dismiss').and.resolveTo(true);
    await Promise.all([component.confirm(), component.confirm()]);
    expect(create).toHaveBeenCalledOnceWith({
      firstName: 'Alex',
      lastName: 'Smith',
      country: 'GB',
      gender: ''
    });
    expect(dismiss).toHaveBeenCalledOnceWith(null, 'confirm');
    expect(component.firstName).toBe('');
  });
});
