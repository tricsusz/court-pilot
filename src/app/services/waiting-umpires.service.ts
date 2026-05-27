import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { db } from 'db';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WaitingUmpiresService {
  /**
   * Reactive list sorted by order
   */
  readonly waitingUmpires = toSignal(
    from(liveQuery(() => db.waitingUmpires.orderBy('order').toArray())),
    {
      initialValue: []
    }
  );

  /**
   * Add new umpire to queue with max(order) + 1
   */
  async add(umpireId: number): Promise<number> {
    return db.transaction('rw', db.waitingUmpires, async () => {
      const last = await db.waitingUmpires.orderBy('order').last();

      const nextOrder = last ? last.order + 1 : 1;

      return db.waitingUmpires.add({
        umpireId,
        order: nextOrder
      });
    });
  }

  /**
   * Remove from queue
   */
  async remove(id: number): Promise<void> {
    await db.waitingUmpires.delete(id);
  }

  async removeByUmpireId(umpireId: number): Promise<void> {
    const item = await db.waitingUmpires
      .where('umpireId')
      .equals(umpireId)
      .first();

    if (!item?.id) {
      return;
    }

    await db.waitingUmpires.delete(item.id);
  }

  /**
   * Reorder (optional helper)
   */
  async updateOrder(id: number, order: number): Promise<void> {
    await db.waitingUmpires.update(id, { order });
  }

  /**
   * Clear queue
   */
  async clear(): Promise<void> {
    await db.waitingUmpires.clear();
  }
}
