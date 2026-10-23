import { TestBed } from '@angular/core/testing';
import { db } from 'db';
import { CourtServiceJudgeService } from './court.service.judge.service';

describe('CourtServiceJudgeService persistence', () => {
  let service: CourtServiceJudgeService;

  beforeEach(async () => {
    await db.courtServiceJudges.clear();
    service = TestBed.inject(CourtServiceJudgeService);
  });

  afterEach(async () => {
    TestBed.resetTestingModule();
    await db.courtServiceJudges.clear();
  });

  it('saves an assignment and returns its generated ID', async () => {
    const id = await service.save({ umpireId: 10, courtNo: 2 });
    expect(await db.courtServiceJudges.get(id)).toEqual({
      id,
      umpireId: 10,
      courtNo: 2
    });
  });

  it('updates an assignment without changing its court', async () => {
    const id = await service.save({ umpireId: 10, courtNo: 2 });
    expect(await service.update(id, { umpireId: 20 })).toBe(1);
    expect(await db.courtServiceJudges.get(id)).toEqual({
      id,
      umpireId: 20,
      courtNo: 2
    });
    expect(await service.update(id + 100, { umpireId: 30 })).toBe(0);
  });

  it('deletes only the selected assignment', async () => {
    const id = await service.save({ umpireId: 10, courtNo: 1 });
    const retained = await service.save({ umpireId: 20, courtNo: 2 });
    await service.delete(id);
    expect(await db.courtServiceJudges.toArray()).toEqual([
      { id: retained, umpireId: 20, courtNo: 2 }
    ]);
  });

  it('removes by official ID while retaining other courts', async () => {
    await service.save({ umpireId: 10, courtNo: 1 });
    const id = await service.save({ umpireId: 20, courtNo: 2 });
    await service.removeByUmpireId(10);
    await service.removeByUmpireId(999);
    expect(await db.courtServiceJudges.toArray()).toEqual([
      { id, umpireId: 20, courtNo: 2 }
    ]);
  });
});
