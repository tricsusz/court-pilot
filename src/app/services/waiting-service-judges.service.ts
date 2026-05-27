import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { db } from 'db';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WaitingServiceJudgesService {
  /**
   * Reactive list sorted by order
   */
  readonly waitingServiceJudges = toSignal(
    from(liveQuery(() => db.waitingServiceJudges.orderBy('order').toArray())),
    {
      initialValue: []
    }
  );

  /**
   * Add new umpire to queue with max(order) + 1
   */
  async add(serviceJudgeId: number): Promise<number> {
    return db.transaction('rw', db.waitingServiceJudges, async () => {
      const last = await db.waitingServiceJudges.orderBy('order').last();

      const nextOrder = last ? last.order + 1 : 1;

      return db.waitingServiceJudges.add({
        serviceJudgeId,
        order: nextOrder
      });
    });
  }

  /**
   * Remove from queue
   */
  async remove(id: number): Promise<void> {
    await db.waitingServiceJudges.delete(id);
  }

  async removeByUmpireId(umpireId: number): Promise<void> {
    const item = await db.waitingServiceJudges
      .where('serviceJudgeId')
      .equals(umpireId)
      .first();

    if (!item?.id) {
      return;
    }

    await db.waitingServiceJudges.delete(item.id);
  }

  /**
   * Reorder (optional helper)
   */
  async updateOrder(id: number, order: number): Promise<void> {
    await db.waitingServiceJudges.update(id, { order });
  }

  /**
   * Clear queue
   */
  async clear(): Promise<void> {
    await db.waitingServiceJudges.clear();
  }
}
