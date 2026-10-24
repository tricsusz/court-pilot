import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { CourtServiceJudge, CourtUmpire, Settings, Umpire } from 'db';
import { Tab1Page } from './tab1.page';
import { SettingsService } from '../services/settings-service';
import { UmpireService } from '../services/umpire.service';
import { WaitingUmpiresService } from '../services/waiting-umpires.service';
import { WaitingServiceJudgesService } from '../services/waiting-service-judges.service';
import { CourtUmpireService } from '../services/court.umpire.service';
import { CourtServiceJudgeService } from '../services/court.service.judge.service';

// Keep page tests independent of IndexedDB and test the public court actions.
describe('Tab1Page court rotation', () => {
  let component: Tab1Page;
  let fixture: ComponentFixture<Tab1Page>;
  const official = (id: number): Umpire => ({
    id,
    firstName: `Official ${id}`,
    lastName: 'Smith',
    country: 'GB',
    gender: 'M'
  });
  const settings = signal<Settings>({
    id: 1,
    numberOfCourts: 3,
    withServiceJudge: true,
    showAlert: false
  });
  const umpires = signal<Umpire[]>([]);
  const courtUmpires = signal<CourtUmpire[]>([]);
  const courtJudges = signal<CourtServiceJudge[]>([]);
  let waitingUmpire: jasmine.SpyObj<WaitingUmpiresService>;
  let waitingJudge: jasmine.SpyObj<WaitingServiceJudgesService>;
  let umpireCourt: jasmine.SpyObj<CourtUmpireService>;
  let judgeCourt: jasmine.SpyObj<CourtServiceJudgeService>;
  let alerts: jasmine.SpyObj<AlertController>;

  beforeEach(() => {
    settings.set({
      id: 1,
      numberOfCourts: 3,
      withServiceJudge: true,
      showAlert: false
    });
    umpires.set([
      official(1),
      official(2),
      official(3),
      official(4),
      official(5)
    ]);
    courtUmpires.set([]);
    courtJudges.set([]);
    waitingUmpire = jasmine.createSpyObj(
      'WaitingUmpiresService',
      ['getCurrentUmpire', 'add', 'removeByUmpireId'],
      { waitingUmpires: signal([{ id: 1, umpireId: 1, order: 1 }]) }
    );
    waitingJudge = jasmine.createSpyObj(
      'WaitingServiceJudgesService',
      ['getCurrentUmpire', 'add', 'removeByUmpireId'],
      { waitingServiceJudges: signal([{ id: 1, serviceJudgeId: 2, order: 1 }]) }
    );
    umpireCourt = jasmine.createSpyObj(
      'CourtUmpireService',
      ['save', 'removeByUmpireId'],
      { umpires: courtUmpires }
    );
    judgeCourt = jasmine.createSpyObj(
      'CourtServiceJudgeService',
      ['save', 'removeByUmpireId'],
      { umpires: courtJudges }
    );
    alerts = jasmine.createSpyObj('AlertController', ['create']);
    waitingUmpire.getCurrentUmpire.and.resolveTo(official(1));
    waitingJudge.getCurrentUmpire.and.resolveTo(official(2));
    waitingUmpire.add.and.resolveTo(1);
    waitingJudge.add.and.resolveTo(1);
    umpireCourt.save.and.resolveTo(1);
    judgeCourt.save.and.resolveTo(1);
    waitingUmpire.removeByUmpireId.and.resolveTo();
    waitingJudge.removeByUmpireId.and.resolveTo();
    umpireCourt.removeByUmpireId.and.resolveTo();
    judgeCourt.removeByUmpireId.and.resolveTo();
    TestBed.configureTestingModule({
      providers: [
        { provide: SettingsService, useValue: { settings } },
        { provide: UmpireService, useValue: { umpires } },
        { provide: WaitingUmpiresService, useValue: waitingUmpire },
        { provide: WaitingServiceJudgesService, useValue: waitingJudge },
        { provide: CourtUmpireService, useValue: umpireCourt },
        { provide: CourtServiceJudgeService, useValue: judgeCourt },
        { provide: AlertController, useValue: alerts }
      ]
    });
    fixture = TestBed.createComponent(Tab1Page);
    component = fixture.componentInstance;
  });

  it('waits for confirmation before assigning officials', async () => {
    settings.update((value) => ({ ...value, showAlert: true }));
    const present = jasmine.createSpy('present').and.resolveTo();
    alerts.create.and.resolveTo({ present } as unknown as HTMLIonAlertElement);
    await component.showAddConfirmation(2);
    expect(present).toHaveBeenCalledTimes(1);
    expect(umpireCourt.save).not.toHaveBeenCalled();
    expect(judgeCourt.save).not.toHaveBeenCalled();
    const options = alerts.create.calls.mostRecent().args[0];
    const confirm = options?.buttons?.find(
      (button) => typeof button !== 'string' && button.role === 'confirm'
    );
    expect(confirm).toBeDefined();
    if (typeof confirm === 'object' && typeof confirm.handler === 'function') {
      confirm.handler(undefined);
    }
    await fixture.whenStable();
    expect(umpireCourt.save).toHaveBeenCalledOnceWith({
      courtNo: 2,
      umpireId: 1
    });
    expect(judgeCourt.save).toHaveBeenCalledOnceWith({
      courtNo: 2,
      umpireId: 2
    });
  });

  it('returns a lone umpire to the umpire queue after confirming rotation', async () => {
    settings.update((value) => ({
      ...value,
      showAlert: true,
      withServiceJudge: false
    }));
    courtUmpires.set([{ id: 1, umpireId: 3, courtNo: 2 }]);
    const present = jasmine.createSpy('present').and.resolveTo();
    alerts.create.and.resolveTo({ present } as unknown as HTMLIonAlertElement);
    await component.showRemoveConfirmation(2);
    expect(umpireCourt.removeByUmpireId).not.toHaveBeenCalled();
    const options = alerts.create.calls.mostRecent().args[0];
    const confirm = options?.buttons?.find(
      (button) => typeof button !== 'string' && button.role === 'confirm'
    );
    expect(confirm).toBeDefined();
    if (typeof confirm === 'object' && typeof confirm.handler === 'function') {
      confirm.handler(undefined);
    }
    await fixture.whenStable();
    expect(umpireCourt.removeByUmpireId).toHaveBeenCalledOnceWith(3);
    expect(waitingUmpire.add).toHaveBeenCalledOnceWith(3);
    expect(waitingJudge.add).not.toHaveBeenCalled();
    expect(judgeCourt.removeByUmpireId).not.toHaveBeenCalled();
  });

  it('assigns both queue heads and removes them from their queues', async () => {
    await component.showAddConfirmation(3);
    await fixture.whenStable();
    expect(umpireCourt.save).toHaveBeenCalledOnceWith({
      courtNo: 3,
      umpireId: 1
    });
    expect(judgeCourt.save).toHaveBeenCalledOnceWith({
      courtNo: 3,
      umpireId: 2
    });
    expect(waitingUmpire.removeByUmpireId).toHaveBeenCalledOnceWith(1);
    expect(waitingJudge.removeByUmpireId).toHaveBeenCalledOnceWith(2);
    expect(alerts.create).not.toHaveBeenCalled();
  });

  it('does not assign either role when the required service judge is missing', async () => {
    waitingJudge.getCurrentUmpire.and.resolveTo(undefined);
    await component.showAddConfirmation(1);
    expect(umpireCourt.save).not.toHaveBeenCalled();
    expect(judgeCourt.save).not.toHaveBeenCalled();
    expect(waitingUmpire.removeByUmpireId).not.toHaveBeenCalled();
  });

  it('does not assign when the umpire queue is empty', async () => {
    waitingUmpire.getCurrentUmpire.and.resolveTo(undefined);
    await component.showAddConfirmation(1);
    expect(umpireCourt.save).not.toHaveBeenCalled();
    expect(judgeCourt.save).not.toHaveBeenCalled();
  });

  it('assigns only an umpire when service judges are disabled', async () => {
    settings.update((value) => ({ ...value, withServiceJudge: false }));
    await component.showAddConfirmation(2);
    await fixture.whenStable();
    expect(umpireCourt.save).toHaveBeenCalledOnceWith({
      courtNo: 2,
      umpireId: 1
    });
    expect(waitingUmpire.removeByUmpireId).toHaveBeenCalledOnceWith(1);
    expect(judgeCourt.save).not.toHaveBeenCalled();
    expect(waitingJudge.removeByUmpireId).not.toHaveBeenCalled();
  });

  it('swaps outgoing officials into the opposite role queues', async () => {
    courtUmpires.set([{ id: 1, umpireId: 3, courtNo: 2 }]);
    courtJudges.set([{ id: 1, umpireId: 4, courtNo: 2 }]);
    await component.showRemoveConfirmation(2);
    await fixture.whenStable();
    expect(umpireCourt.removeByUmpireId).toHaveBeenCalledOnceWith(3);
    expect(judgeCourt.removeByUmpireId).toHaveBeenCalledOnceWith(4);
    expect(waitingUmpire.add).toHaveBeenCalledOnceWith(4);
    expect(waitingJudge.add).toHaveBeenCalledOnceWith(3);
  });

  it('leaves an incomplete court unchanged when service judges are required', async () => {
    courtUmpires.set([{ id: 1, umpireId: 3, courtNo: 2 }]);
    await component.showRemoveConfirmation(2);
    expect(umpireCourt.removeByUmpireId).not.toHaveBeenCalled();
    expect(waitingUmpire.add).not.toHaveBeenCalled();
  });

  it('derives rest from all four duty states and reacts to assignment changes', () => {
    courtUmpires.set([{ id: 1, umpireId: 3, courtNo: 2 }]);
    courtJudges.set([{ id: 1, umpireId: 4, courtNo: 2 }]);
    expect(component.onRest().map((item) => item.id)).toEqual([5]);
    courtJudges.set([]);
    expect(component.onRest().map((item) => item.id)).toEqual([4, 5]);
  });

  it('ignores empty and stale court assignments in its court lookup', () => {
    courtUmpires.set([
      { id: 1, umpireId: null, courtNo: 1 },
      { id: 2, umpireId: 999, courtNo: 2 },
      { id: 3, umpireId: 3, courtNo: 3 }
    ]);
    expect([...component.umpireByCourt().entries()]).toEqual([
      [3, official(3)]
    ]);
  });

  it('updates court numbers and service judge availability from settings', () => {
    expect(component.courtIndexes()).toEqual([1, 2, 3]);
    settings.update((value) => ({
      ...value,
      numberOfCourts: 1,
      withServiceJudge: false
    }));
    expect(component.courtIndexes()).toEqual([1]);
    expect(component.serviceJudgeEnabled()).toBeFalse();
  });
});
