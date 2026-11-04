import { TestBed } from '@angular/core/testing';
import { db } from 'db';
import { CourtRotationService } from './court-rotation.service';
import { WaitingUmpiresService } from './waiting-umpires.service';

describe('CourtRotationService', () => {
  let service: CourtRotationService;
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
      numberOfCourts: 3,
      withServiceJudge: true,
      showAlert: false
    });
    await db.umpires.bulkPut(
      [1, 2, 3].map((id) => ({
        id,
        firstName: `Official ${id}`,
        lastName: 'Smith',
        country: 'GB',
        gender: 'M'
      }))
    );
    service = TestBed.inject(CourtRotationService);
  });
  afterEach(async () => {
    TestBed.resetTestingModule();
    await clear();
  });

  it('assigns the lowest orders even when the queues do not start at one', async () => {
    await db.waitingUmpires.bulkAdd([
      { umpireId: 1, order: 3 },
      { umpireId: 3, order: 4 }
    ]);
    await db.waitingServiceJudges.add({ serviceJudgeId: 2, order: 8 });
    await service.assignNext(1, 1, 2);
    expect(
      (await db.courtUmpires.toArray()).map((item) => item.umpireId)
    ).toEqual([1]);
    expect(
      (await db.courtServiceJudges.toArray()).map((item) => item.umpireId)
    ).toEqual([2]);
    expect(
      (await db.waitingUmpires.toArray()).map((item) => [
        item.umpireId,
        item.order
      ])
    ).toEqual([[3, 1]]);
    expect(await db.waitingServiceJudges.count()).toBe(0);
  });

  it('serializes repeated assignments so officials cannot occupy two courts', async () => {
    await db.waitingUmpires.add({ umpireId: 1, order: 1 });
    await db.waitingServiceJudges.add({ serviceJudgeId: 2, order: 1 });
    await Promise.all([
      service.assignNext(1, 1, 2),
      service.assignNext(2, 1, 2)
    ]);
    expect(await db.courtUmpires.count()).toBe(1);
    expect(await db.courtServiceJudges.count()).toBe(1);
  });

  it('ignores stale confirmations and occupied courts', async () => {
    await db.waitingUmpires.add({ umpireId: 3, order: 1 });
    await db.waitingServiceJudges.add({ serviceJudgeId: 2, order: 1 });
    await service.assignNext(1, 1, 2);
    expect(await db.courtUmpires.count()).toBe(0);
    await db.courtUmpires.add({ courtNo: 1, umpireId: 1 });
    await service.assignNext(1, 3, 2);
    expect(await db.courtUmpires.count()).toBe(1);
    expect(await db.waitingUmpires.count()).toBe(1);
  });

  it('rotates both officials into the opposite queues', async () => {
    await db.courtUmpires.add({ umpireId: 1, courtNo: 1 });
    await db.courtServiceJudges.add({ umpireId: 2, courtNo: 1 });
    await service.rotate(1, 1, 2);
    expect(await db.courtUmpires.count()).toBe(0);
    expect(await db.courtServiceJudges.count()).toBe(0);
    expect((await db.waitingUmpires.toArray())[0].umpireId).toBe(2);
    expect((await db.waitingServiceJudges.toArray())[0].serviceJudgeId).toBe(1);
  });

  it('returns a lone umpire when service judges are disabled', async () => {
    await db.settings.update(1, { withServiceJudge: false });
    await db.courtUmpires.add({ umpireId: 1, courtNo: 1 });
    await service.rotate(1, 1);
    expect(await db.courtUmpires.count()).toBe(0);
    expect((await db.waitingUmpires.toArray())[0].umpireId).toBe(1);
  });

  it('rolls back court removal if requeuing fails', async () => {
    await db.settings.update(1, { withServiceJudge: false });
    await db.courtUmpires.add({ umpireId: 1, courtNo: 1 });
    spyOn(TestBed.inject(WaitingUmpiresService), 'add').and.rejectWith(
      new Error('write failed')
    );
    await expectAsync(service.rotate(1, 1)).toBeRejectedWithError(
      'write failed'
    );
    expect(await db.courtUmpires.count()).toBe(1);
    expect(await db.waitingUmpires.count()).toBe(0);
  });

  it('moves and reorders officials without duplicating their states', async () => {
    await db.waitingUmpires.bulkAdd([
      { umpireId: 1, order: 1 },
      { umpireId: 2, order: 2 }
    ]);
    await service.moveToQueue(2, 'umpire', 1);
    expect(
      (await db.waitingUmpires.orderBy('order').toArray()).map(
        (item) => item.umpireId
      )
    ).toEqual([2, 1]);
    await service.moveToQueue(1, 'serviceJudge', 1);
    await service.moveToCourt(1, 'umpire', 1);
    expect(await db.waitingServiceJudges.count()).toBe(0);
    expect(
      (await db.waitingUmpires.toArray()).map((item) => item.umpireId)
    ).toEqual([2]);
    await service.moveToRest(1);
    expect(await db.courtUmpires.count()).toBe(0);
  });

  it('does not move to an occupied or invalid court or a disabled role', async () => {
    await db.waitingUmpires.add({ umpireId: 1, order: 1 });
    await db.courtUmpires.add({ umpireId: 2, courtNo: 1 });
    await service.moveToCourt(1, 'umpire', 1);
    await service.moveToCourt(1, 'umpire', 4);
    await db.settings.update(1, { withServiceJudge: false });
    await service.moveToQueue(1, 'serviceJudge', 1);
    await service.moveToCourt(1, 'serviceJudge', 2);
    expect(await db.waitingUmpires.count()).toBe(1);
    expect(await db.waitingServiceJudges.count()).toBe(0);
    expect(await db.courtUmpires.count()).toBe(1);
    expect(await db.courtServiceJudges.count()).toBe(0);
  });
});
