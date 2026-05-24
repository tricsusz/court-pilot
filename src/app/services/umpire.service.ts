import { Injectable } from '@angular/core';
import { db } from 'db';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';
import { Umpire } from '../../../db';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class UmpireService {
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
    return await db.umpires.add({
      ...umpire
    } as Umpire);
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
    await db.umpires.delete(id);
  }

  /**
   * Delete all
   */
  async clear(): Promise<void> {
    await db.umpires.clear();
  }
}
