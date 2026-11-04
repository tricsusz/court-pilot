import { inject, Injectable } from '@angular/core';
import { db } from 'db';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';
import { Umpire } from 'db';
import { WaitingUmpiresService } from './waiting-umpires.service';
import { WaitingServiceJudgesService } from './waiting-service-judges.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class UmpireService {
  private readonly waitingUmpires = inject(WaitingUmpiresService);
  private readonly waitingJudges = inject(WaitingServiceJudgesService);
  /**
   * Reactive signal with all umpires
   */
  readonly umpires = toSignal(
    from(liveQuery(() => db.umpires.orderBy('lastName').toArray())),
    {
      initialValue: []
    }
  );

  /**
   * Create
   */
  async create(umpire: Omit<Umpire, 'id'>): Promise<number> {
    return db.umpires.add({ ...umpire });
  }

  /**
   * Read one
   */
  async getById(id: number): Promise<Umpire | undefined> {
    return await db.umpires.get(id);
  }

  /**
   * Update
   */
  async update(
    id: number,
    changes: Partial<Omit<Umpire, 'id'>>
  ): Promise<number> {
    return await db.umpires.update(id, changes);
  }

  /**
   * Delete
   */
  async delete(id: number): Promise<void> {
    await db.transaction(
      'rw',
      [
        db.umpires,
        db.waitingUmpires,
        db.waitingServiceJudges,
        db.courtUmpires,
        db.courtServiceJudges
      ],
      async () => {
        await db.waitingUmpires.where('umpireId').equals(id).delete();
        await db.waitingServiceJudges
          .where('serviceJudgeId')
          .equals(id)
          .delete();
        await db.courtUmpires.where('umpireId').equals(id).delete();
        await db.courtServiceJudges.where('umpireId').equals(id).delete();
        await this.waitingUmpires.reinitOrders();
        await this.waitingJudges.reinitOrders();
        await db.umpires.delete(id);
      }
    );
  }

  /**
   * Delete all
   */
  async clear(): Promise<void> {
    await db.transaction(
      'rw',
      [
        db.umpires,
        db.waitingUmpires,
        db.waitingServiceJudges,
        db.courtUmpires,
        db.courtServiceJudges
      ],
      async () => {
        await db.waitingUmpires.clear();
        await db.waitingServiceJudges.clear();
        await db.courtUmpires.clear();
        await db.courtServiceJudges.clear();
        await db.umpires.clear();
      }
    );
  }
}
