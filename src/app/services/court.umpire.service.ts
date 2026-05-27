import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CourtUmpire, db } from 'db';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourtUmpireService {
  /**
   * All court umpires (reactive)
   */
  readonly umpires = toSignal(
    from(liveQuery(() => db.courtUmpires.orderBy('courtNo').toArray())),
    { initialValue: [] }
  );

  /**
   * Get by court number (reactive single)
   */
  getByCourtNo(courtNo: number) {
    return toSignal<CourtUmpire | undefined>(
      liveQuery(() => db.courtUmpires.where('courtNo').equals(courtNo).first()),
      { initialValue: undefined }
    );
  }

  /**
   * Create / update
   */
  async save(item: Omit<CourtUmpire, 'id'>): Promise<number> {
    return db.courtUmpires.add(item as CourtUmpire);
  }

  async update(id: number, changes: Partial<CourtUmpire>): Promise<number> {
    return db.courtUmpires.update(id, changes);
  }

  async delete(id: number): Promise<void> {
    await db.courtUmpires.delete(id);
  }

  async removeByUmpireId(umpireId: number): Promise<void> {
    const item = await db.courtUmpires
      .where('umpireId')
      .equals(umpireId)
      .first();

    if (!item?.id) {
      return;
    }

    await db.courtUmpires.delete(item.id);
  }
}
