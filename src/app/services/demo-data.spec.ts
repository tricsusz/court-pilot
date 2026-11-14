import { db } from 'db';
import { seedDemoData } from './demo-data';

describe('Sample roster', () => {
  const clear = async () => {
    await Promise.all([
      db.umpires.clear(),
      db.settings.clear(),
      db.waitingUmpires.clear(),
      db.waitingServiceJudges.clear()
    ]);
  };

  beforeEach(clear);
  afterEach(clear);

  for (const withServiceJudge of [true, false]) {
    it(`creates 20 officials with service judges ${withServiceJudge ? 'enabled' : 'disabled'}`, async () => {
      await db.settings.put({
        id: 1,
        numberOfCourts: 5,
        startingCourtNumber: 1,
        withServiceJudge,
        showAlert: false
      });
      await seedDemoData();
      expect(await db.umpires.count()).toBe(20);
      expect(await db.waitingUmpires.count()).toBe(withServiceJudge ? 8 : 14);
      expect(await db.waitingServiceJudges.count()).toBe(
        withServiceJudge ? 6 : 0
      );
      const umpireIds = (await db.waitingUmpires.toArray()).map(
        (row) => row.umpireId
      );
      const judgeIds = (await db.waitingServiceJudges.toArray()).map(
        (row) => row.serviceJudgeId
      );
      expect(new Set([...umpireIds, ...judgeIds]).size).toBe(14);
      await seedDemoData();
      expect(await db.umpires.count()).toBe(20);
    });
  }

  it('preserves existing officials and appends to existing queue orders', async () => {
    const id = await db.umpires.add({
      firstName: 'Existing',
      lastName: 'Official',
      country: 'GB',
      gender: 'M'
    });
    await db.waitingUmpires.add({ umpireId: id, order: 3 });
    await seedDemoData();
    expect(await db.umpires.count()).toBe(21);
    expect((await db.umpires.get(id))?.firstName).toBe('Existing');
    expect(
      (await db.waitingUmpires.orderBy('order').toArray()).map(
        (row) => row.order
      )
    ).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});
