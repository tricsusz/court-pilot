import { TestBed } from '@angular/core/testing';
import { db } from 'db';
import { WaitingDutyService } from './waiting-duty.service';

describe('WaitingDutyService', () => {
  let service: WaitingDutyService;
  beforeEach(async () => {
    await Promise.all([
      db.settings.clear(),
      db.umpires.clear(),
      db.waitingUmpires.clear(),
      db.waitingServiceJudges.clear(),
      db.courtUmpires.clear(),
      db.courtServiceJudges.clear()
    ]);
    await db.settings.put({
      id: 1,
      withServiceJudge: true,
      waitingListQuickButtons: true,
      showAlert: false,
      numberOfCourts: 5
    });
    await db.umpires.put({
      id: 1,
      firstName: 'Alex',
      lastName: 'Smith',
      gender: 'M',
      country: 'GB'
    });
    service = TestBed.inject(WaitingDutyService);
  });
  afterEach(async () => {
    TestBed.resetTestingModule();
    await Promise.all([
      db.settings.clear(),
      db.umpires.clear(),
      db.waitingUmpires.clear(),
      db.waitingServiceJudges.clear(),
      db.courtUmpires.clear(),
      db.courtServiceJudges.clear()
    ]);
  });
  for (const role of ['umpire', 'serviceJudge'] as const) {
    it(`remembers the ${role} queue and returns at its bottom only once`, async () => {
      if (role === 'umpire')
        await db.waitingUmpires.add({ umpireId: 1, order: 1 });
      else await db.waitingServiceJudges.add({ serviceJudgeId: 1, order: 1 });
      await service.move(1, 'rest');
      expect((await db.umpires.get(1))?.returnToQueue).toBe(role);
      expect(
        (await db.waitingUmpires.count()) +
          (await db.waitingServiceJudges.count())
      ).toBe(0);
      if (role === 'umpire')
        await db.waitingUmpires.add({ umpireId: 2, order: 1 });
      else await db.waitingServiceJudges.add({ serviceJudgeId: 2, order: 1 });
      await Promise.all([service.move(1, 'umpire'), service.move(1, 'umpire')]);
      const items =
        role === 'umpire'
          ? await db.waitingUmpires.orderBy('order').toArray()
          : await db.waitingServiceJudges.orderBy('order').toArray();
      expect(items.map((item) => item.order)).toEqual([1, 2]);
      expect((await db.umpires.get(1))?.returnToQueue).toBeUndefined();
    });
  }
  for (const role of ['umpire', 'serviceJudge'] as const) {
    it(`saves the ${role} origin on a drag move even with quick buttons disabled`, async () => {
      await db.settings.update(1, { waitingListQuickButtons: false });
      if (role === 'umpire')
        await db.waitingUmpires.add({ umpireId: 1, order: 1 });
      else await db.waitingServiceJudges.add({ serviceJudgeId: 1, order: 1 });
      await service.moveToRest(1);
      expect((await db.umpires.get(1))?.returnToQueue).toBe(role);
      expect(await db.waitingUmpires.count()).toBe(0);
      expect(await db.waitingServiceJudges.count()).toBe(0);
    });
  }

  it('does not return officials without a saved origin', async () => {
    await service.move(1, 'umpire');
    expect(await db.waitingUmpires.count()).toBe(0);
    expect(await db.waitingServiceJudges.count()).toBe(0);
  });

  it('ignores stale return actions for assigned officials', async () => {
    await db.courtUmpires.add({ umpireId: 1, courtNo: 1 });
    await service.move(1, 'umpire');
    expect(await db.waitingUmpires.count()).toBe(0);
  });
  it('does nothing when service judges are disabled', async () => {
    await db.settings.update(1, { withServiceJudge: false });
    await service.move(1, 'umpire');
    expect(await db.waitingUmpires.count()).toBe(0);
  });
});
