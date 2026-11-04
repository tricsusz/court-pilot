import { TestBed } from '@angular/core/testing';
import { db } from 'db';
import { UmpireService } from './umpire.service';

describe('UmpireService persistence', () => {
  let service: UmpireService;
  const official = {
    firstName: 'Alex',
    lastName: 'Smith',
    country: 'GB',
    gender: 'M'
  };

  beforeEach(async () => {
    await Promise.all([
      db.umpires.clear(),
      db.waitingUmpires.clear(),
      db.waitingServiceJudges.clear(),
      db.courtUmpires.clear(),
      db.courtServiceJudges.clear()
    ]);
    service = TestBed.inject(UmpireService);
  });

  afterEach(async () => {
    TestBed.resetTestingModule();
    await Promise.all([
      db.umpires.clear(),
      db.waitingUmpires.clear(),
      db.waitingServiceJudges.clear(),
      db.courtUmpires.clear(),
      db.courtServiceJudges.clear()
    ]);
  });

  it('creates and retrieves a complete official record', async () => {
    const id = await service.create(official);
    expect(await service.getById(id)).toEqual({ ...official, id });
    expect('id' in official).toBeFalse();
  });

  it('updates selected fields while retaining the rest of the record', async () => {
    const id = await service.create(official);
    expect(await service.update(id, { country: 'HU' })).toBe(1);
    expect(await service.getById(id)).toEqual({
      ...official,
      id,
      country: 'HU'
    });
  });

  it('returns undefined and zero when reading or updating an absent official', async () => {
    expect(await service.getById(999)).toBeUndefined();
    expect(await service.update(999, { country: 'HU' })).toBe(0);
  });

  it('deletes one official and retains the other', async () => {
    const id = await service.create(official);
    const retained = await service.create({ ...official, firstName: 'Sam' });
    await service.delete(id);
    expect(await service.getById(id)).toBeUndefined();
    expect(await service.getById(retained)).toEqual({
      ...official,
      firstName: 'Sam',
      id: retained
    });
  });

  it('deletes dependent duty records and closes the queue gap', async () => {
    const id = await service.create(official);
    const retained = await service.create({ ...official, firstName: 'Sam' });
    await db.waitingUmpires.bulkAdd([
      { umpireId: id, order: 1 },
      { umpireId: retained, order: 2 }
    ]);
    await db.waitingServiceJudges.add({ serviceJudgeId: id, order: 1 });
    await db.courtUmpires.add({ umpireId: id, courtNo: 1 });
    await db.courtServiceJudges.add({ umpireId: id, courtNo: 2 });
    await service.delete(id);
    expect(
      (await db.waitingUmpires.toArray()).map((item) => [
        item.umpireId,
        item.order
      ])
    ).toEqual([[retained, 1]]);
    expect(await db.waitingServiceJudges.count()).toBe(0);
    expect(await db.courtUmpires.count()).toBe(0);
    expect(await db.courtServiceJudges.count()).toBe(0);
  });

  it('clears all officials', async () => {
    await service.create(official);
    await service.create({ ...official, firstName: 'Sam' });
    await service.clear();
    expect(await db.umpires.count()).toBe(0);
  });
});
