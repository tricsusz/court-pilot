import { TestBed } from '@angular/core/testing';
import { db } from 'db';
import { WaitingUmpiresService } from './waiting-umpires.service';

describe('WaitingUmpiresService queue behavior', () => {
  let service: WaitingUmpiresService;

  beforeEach(async () => {
    await db.waitingUmpires.clear();
    await db.umpires.clear();
    service = TestBed.inject(WaitingUmpiresService);
  });

  afterEach(async () => {
    TestBed.resetTestingModule();
    await db.waitingUmpires.clear();
    await db.umpires.clear();
  });

  async function queue() {
    const items = await db.waitingUmpires.orderBy('order').toArray();
    return items.map((item) => [item.umpireId, item.order]);
  }

  async function seed() {
    await service.add(10);
    await service.add(20);
    await service.add(30);
  }

  it('starts an empty queue at one and appends in FIFO order', async () => {
    await seed();
    expect(await queue()).toEqual([
      [10, 1],
      [20, 2],
      [30, 3]
    ]);
  });

  it('appends after the greatest numeric order, regardless of insertion order', async () => {
    await db.waitingUmpires.bulkAdd([
      { umpireId: 10, order: 9 },
      { umpireId: 20, order: 2 }
    ]);
    await service.add(30);
    expect(await queue()).toEqual([
      [20, 2],
      [10, 9],
      [30, 10]
    ]);
  });

  it('serializes concurrent appends with distinct consecutive orders', async () => {
    await Promise.all([service.add(10), service.add(20), service.add(30)]);
    const items = await queue();
    expect(items.map((item) => item[1])).toEqual([1, 2, 3]);
    expect(items.map((item) => item[0]).sort()).toEqual([10, 20, 30]);
  });

  it('inserts at a requested position and shifts following officials', async () => {
    await seed();
    await service.add(40, 2);
    expect(await queue()).toEqual([
      [10, 1],
      [40, 2],
      [20, 3],
      [30, 4]
    ]);
  });

  it('moves an official toward the front', async () => {
    await seed();
    await service.moveToPosition(30, 1);
    expect(await queue()).toEqual([
      [30, 1],
      [10, 2],
      [20, 3]
    ]);
  });

  it('moves an official toward the back', async () => {
    await seed();
    await service.moveToPosition(10, 3);
    expect(await queue()).toEqual([
      [20, 1],
      [30, 2],
      [10, 3]
    ]);
  });

  it('leaves the queue unchanged for a missing official or unchanged position', async () => {
    await seed();
    await service.moveToPosition(999, 2);
    await service.moveToPosition(20, 2);
    expect(await queue()).toEqual([
      [10, 1],
      [20, 2],
      [30, 3]
    ]);
  });

  it('removes by official ID and closes the gap', async () => {
    await seed();
    await service.removeByUmpireId(20);
    expect(await queue()).toEqual([
      [10, 1],
      [30, 2]
    ]);
    await service.removeByUmpireId(999);
    expect(await queue()).toEqual([
      [10, 1],
      [30, 2]
    ]);
  });

  it('removes by queue record ID rather than official ID', async () => {
    await service.add(10);
    const id = await service.add(20);
    await service.add(30);
    await service.remove(id);
    expect(await queue()).toEqual([
      [10, 1],
      [30, 2]
    ]);
  });

  it('normalizes gaps while preserving numeric ordering', async () => {
    await db.waitingUmpires.bulkAdd([
      { umpireId: 10, order: 12 },
      { umpireId: 20, order: 4 }
    ]);
    await service.reinitOrders();
    expect(await queue()).toEqual([
      [20, 1],
      [10, 2]
    ]);
  });

  it('resolves the queue head to the complete official record', async () => {
    const official = {
      firstName: 'Alex',
      lastName: 'Smith',
      country: 'GB',
      gender: 'M'
    };
    const id = await db.umpires.add(official);
    await service.add(id);
    expect(await service.getCurrentUmpire()).toEqual({ ...official, id });
  });

  it('returns undefined for an empty queue or a missing roster record', async () => {
    expect(await service.getCurrentUmpire()).toBeUndefined();
    await service.add(999);
    expect(await service.getCurrentUmpire()).toBeUndefined();
  });

  it('updates only the selected record order', async () => {
    const id = await service.add(10);
    await service.add(20);
    await service.updateOrder(id, 5);
    expect(await queue()).toEqual([
      [20, 2],
      [10, 5]
    ]);
  });

  it('clears the queue and restarts ordering at one', async () => {
    await seed();
    await service.clear();
    expect(await queue()).toEqual([]);
    await service.add(40);
    expect(await queue()).toEqual([[40, 1]]);
  });
});
