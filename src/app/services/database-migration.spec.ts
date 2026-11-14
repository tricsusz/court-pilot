import Dexie from 'dexie';
import { db } from 'db';

describe('Starting court number migration', () => {
  afterEach(async () => {
    await db.delete();
    await db.open();
  });

  it('upgrades version 2 settings to start at one without changing duty or queues', async () => {
    await db.delete();
    const legacy = new Dexie(db.name);
    legacy.version(2).stores({
      umpires: '++id, lastName',
      courtUmpires: '++id, courtNo, umpireId',
      courtServiceJudges: '++id, courtNo, umpireId',
      settings: '++id',
      waitingUmpires: '++id, order, umpireId',
      waitingServiceJudges: '++id, order, serviceJudgeId'
    });
    const settings = {
      id: 1,
      numberOfCourts: 6,
      withServiceJudge: true,
      showAlert: false,
      waitingListQuickButtons: true
    };
    try {
      await legacy.table('settings').put(settings);
      await legacy.table('umpires').put({
        id: 1,
        firstName: 'Alex',
        lastName: 'Smith',
        country: 'GB',
        gender: 'M'
      });
      await legacy
        .table('courtUmpires')
        .put({ id: 1, courtNo: 6, umpireId: 1 });
      await legacy
        .table('courtServiceJudges')
        .put({ id: 1, courtNo: 6, umpireId: 2 });
      await legacy
        .table('waitingUmpires')
        .put({ id: 1, umpireId: 3, order: 4 });
      await legacy
        .table('waitingServiceJudges')
        .put({ id: 1, serviceJudgeId: 4, order: 7 });
    } finally {
      legacy.close();
    }
    await db.open();
    expect(db.verno).toBe(3);
    expect(await db.settings.get(1)).toEqual({
      ...settings,
      startingCourtNumber: 1
    });
    expect((await db.umpires.get(1))?.firstName).toBe('Alex');
    expect(await db.courtUmpires.get(1)).toEqual({
      id: 1,
      courtNo: 6,
      umpireId: 1
    });
    expect(await db.courtServiceJudges.get(1)).toEqual({
      id: 1,
      courtNo: 6,
      umpireId: 2
    });
    expect(await db.waitingUmpires.get(1)).toEqual({
      id: 1,
      umpireId: 3,
      order: 4
    });
    expect(await db.waitingServiceJudges.get(1)).toEqual({
      id: 1,
      serviceJudgeId: 4,
      order: 7
    });
  });
});
