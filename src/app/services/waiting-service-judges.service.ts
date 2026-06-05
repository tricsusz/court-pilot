import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { db, Umpire } from 'db';
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
  async add(serviceJudgeId: number, toPosition?: number): Promise<number> {
    const id = await db.transaction('rw', db.waitingServiceJudges, async () => {
      const last = await db.waitingServiceJudges.orderBy('order').last();

      const nextOrder = last ? last.order + 1 : 1;

      return db.waitingServiceJudges.add({
        serviceJudgeId,
        order: nextOrder
      });
    });

    if (toPosition !== undefined) {
      await this.moveToPosition(serviceJudgeId, toPosition);
    }

    return id;
  }

  /**
   * Remove from queue
   */
  async remove(id: number): Promise<void> {
    await db.waitingServiceJudges.delete(id);

    await this.reinitOrders();
  }

  async removeByUmpireId(umpireId: number): Promise<void> {
    const item = await db.waitingServiceJudges
      .where('serviceJudgeId')
      .equals(umpireId)
      .first();

    if (!item?.id) {
      return;
    }

    await this.remove(item.id);
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

  async moveToPosition(umpireId: number, newOrder: number): Promise<void> {
    await db.transaction('rw', db.waitingServiceJudges, async () => {
      const current = await db.waitingServiceJudges
        .where('serviceJudgeId')
        .equals(umpireId)
        .first();

      if (!current) {
        return;
      }

      const oldOrder = current.order;

      if (oldOrder === newOrder) {
        return;
      }

      if (newOrder < oldOrder) {
        // Moving up: shift affected records down

        const affected = await db.waitingServiceJudges
          .filter(
            (item) =>
              item.order >= newOrder &&
              item.order < oldOrder &&
              item.id !== current.id
          )
          .toArray();

        for (const item of affected) {
          await db.waitingServiceJudges.update(item.id!, {
            order: item.order + 1
          });
        }
      } else {
        // Moving down: shift affected records up

        const affected = await db.waitingServiceJudges
          .filter(
            (item) =>
              item.order > oldOrder &&
              item.order <= newOrder &&
              item.id !== current.id
          )
          .toArray();

        for (const item of affected) {
          await db.waitingServiceJudges.update(item.id!, {
            order: item.order - 1
          });
        }
      }

      await db.waitingServiceJudges.update(current.id!, {
        order: newOrder
      });
    });
  }

  async reinitOrders(): Promise<void> {
    await db.transaction('rw', db.waitingServiceJudges, async () => {
      const items = await db.waitingServiceJudges.orderBy('order').toArray();

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const expectedOrder = i + 1;

        if (item.order !== expectedOrder) {
          await db.waitingServiceJudges.update(item.id!, {
            order: expectedOrder
          });
        }
      }
    });
  }
}
