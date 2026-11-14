import { TestBed } from '@angular/core/testing';
import { provideZoneChangeDetection } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { db } from 'db';
import { Tab1Page } from './tab1.page';

describe('Tab1Page quick actions with persistence', () => {
  const clear = async () => {
    await Promise.all([
      db.settings.clear(),
      db.umpires.clear(),
      db.waitingUmpires.clear(),
      db.waitingServiceJudges.clear(),
      db.courtUmpires.clear(),
      db.courtServiceJudges.clear()
    ]);
  };

  beforeEach(async () => {
    await clear();
    await db.settings.put({
      id: 1,
      numberOfCourts: 1,
      startingCourtNumber: 1,
      withServiceJudge: true,
      waitingListQuickButtons: true,
      showAlert: false
    });
    await db.umpires.bulkPut(
      [1, 2].map((id) => ({
        id,
        firstName: `Official ${id}`,
        lastName: 'Smith',
        country: 'GB',
        gender: 'M'
      }))
    );
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()]
    });
  });

  afterEach(async () => {
    TestBed.resetTestingModule();
    await clear();
  });

  for (const withServiceJudge of [false, true]) {
    it(`removes court officials with alerts off and service judges ${withServiceJudge ? 'enabled' : 'disabled'}`, async () => {
      await db.settings.update(1, { withServiceJudge });
      await db.courtUmpires.add({ courtNo: 1, umpireId: 1 });
      if (withServiceJudge) {
        await db.courtServiceJudges.add({ courtNo: 1, umpireId: 2 });
      }
      const fixture = TestBed.createComponent(Tab1Page);
      const page = fixture.componentInstance;
      const alerts = spyOn(TestBed.inject(AlertController), 'create');
      const waitUntil = async (condition: () => boolean) => {
        for (let attempt = 0; attempt < 100 && !condition(); attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
        expect(condition()).toBeTrue();
      };
      await waitUntil(
        () =>
          page.settings()?.withServiceJudge === withServiceJudge &&
          page.umpireByCourt().has(1) &&
          (!withServiceJudge || page.serviceJudgeByCourt().has(1))
      );
      fixture.autoDetectChanges();
      const button: HTMLElement = fixture.nativeElement.querySelector(
        '.court-actions ion-button'
      );
      expect(button).not.toBeNull();
      button.click();
      await waitUntil(
        () =>
          !page.umpireByCourt().has(1) &&
          !page.serviceJudgeByCourt().has(1) &&
          page.waitingUmpires().length === 1 &&
          (!withServiceJudge || page.waitingServiceJudges().length === 1)
      );
      expect(await db.courtUmpires.count()).toBe(0);
      expect(await db.courtServiceJudges.count()).toBe(0);
      expect(page.waitingUmpires().map((official) => official.id)).toEqual([
        withServiceJudge ? 2 : 1
      ]);
      expect(
        page.waitingServiceJudges().map((official) => official.id)
      ).toEqual(withServiceJudge ? [1] : []);
      await fixture.whenStable();
      expect(
        fixture.nativeElement.querySelector(
          '.court-actions ion-button[color="danger"]'
        )
      ).toBeNull();
      expect(alerts).not.toHaveBeenCalled();
    });
  }
});
