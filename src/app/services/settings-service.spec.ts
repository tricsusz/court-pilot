import { TestBed } from '@angular/core/testing';
import { db } from 'db';
import { SettingsService } from './settings-service';

describe('SettingsService', () => {
  let service: SettingsService;
  const clear = async () => {
    await Promise.all([
      db.settings.clear(),
      db.courtUmpires.clear(),
      db.courtServiceJudges.clear(),
      db.waitingServiceJudges.clear()
    ]);
  };
  beforeEach(async () => {
    await clear();
    service = TestBed.inject(SettingsService);
    await service.update({ numberOfCourts: 5, withServiceJudge: true });
  });
  afterEach(async () => {
    TestBed.resetTestingModule();
    await clear();
  });

  it('initializes defaults before accepting an immediate update', async () => {
    expect(await db.settings.get(1)).toEqual({
      id: 1,
      numberOfCourts: 5,
      startingCourtNumber: 1,
      withServiceJudge: true,
      showAlert: true,
      waitingListQuickButtons: false
    });
  });

  for (const count of [0, -1, 1.5, NaN, Infinity]) {
    it(`rejects invalid court count ${count} without removing assignments`, async () => {
      await db.courtUmpires.add({ courtNo: 5, umpireId: 1 });
      await service.update({ numberOfCourts: count });
      expect((await db.settings.get(1))?.numberOfCourts).toBe(5);
      expect(await db.courtUmpires.count()).toBe(1);
    });
  }

  it('removes only assignments on eliminated courts', async () => {
    await db.courtUmpires.bulkAdd([
      { courtNo: 1, umpireId: 1 },
      { courtNo: 5, umpireId: 2 }
    ]);
    await db.courtServiceJudges.add({ courtNo: 5, umpireId: 3 });
    await service.update({ numberOfCourts: 2 });
    expect(
      (await db.courtUmpires.toArray()).map((item) => item.courtNo)
    ).toEqual([1]);
    expect(await db.courtServiceJudges.count()).toBe(0);
  });

  it('clears service judge duty and quick buttons when disabling the role', async () => {
    await db.courtServiceJudges.add({ courtNo: 1, umpireId: 1 });
    await db.waitingServiceJudges.add({ serviceJudgeId: 2, order: 1 });
    await service.update({
      withServiceJudge: false,
      waitingListQuickButtons: true
    });
    expect(await db.courtServiceJudges.count()).toBe(0);
    expect(await db.waitingServiceJudges.count()).toBe(0);
    expect((await db.settings.get(1))?.waitingListQuickButtons).toBeFalse();
  });

  for (const start of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    it(`rejects invalid starting court number ${start} without removing assignments`, async () => {
      await db.courtUmpires.add({ courtNo: 1, umpireId: 1 });
      await service.update({ startingCourtNumber: start });
      expect((await db.settings.get(1))?.startingCourtNumber).toBe(1);
      expect(await db.courtUmpires.count()).toBe(1);
    });
  }

  it('keeps assignments within the new range and removes both roles outside it', async () => {
    for (const table of [db.courtUmpires, db.courtServiceJudges]) {
      await table.bulkAdd([
        { courtNo: 4, umpireId: 1 },
        { courtNo: 5, umpireId: 2 },
        { courtNo: 10, umpireId: 3 },
        { courtNo: 11, umpireId: 4 }
      ]);
    }
    await service.update({ startingCourtNumber: 5, numberOfCourts: 6 });
    for (const table of [db.courtUmpires, db.courtServiceJudges]) {
      expect(
        (await table.orderBy('courtNo').toArray()).map((row) => row.courtNo)
      ).toEqual([5, 10]);
    }
    await service.update({ numberOfCourts: 5 });
    expect((await db.courtUmpires.toArray()).map((row) => row.courtNo)).toEqual(
      [5]
    );
    expect(
      (await db.courtServiceJudges.toArray()).map((row) => row.courtNo)
    ).toEqual([5]);
    expect(await db.waitingServiceJudges.count()).toBe(0);
  });
});
