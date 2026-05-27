import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CourtServiceJudge, db } from 'db';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourtServiceJudgeService {
  /**
   * All service judges (reactive)
   */
  readonly umpires = toSignal(
    from(liveQuery(() => db.courtServiceJudges.orderBy('courtNo').toArray())),
    { initialValue: [] }
  );

  /**
   * Get by court number (reactive)
   */
  getByCourtNo(courtNo: number) {
    return toSignal<CourtServiceJudge | undefined>(
      liveQuery(() =>
        db.courtServiceJudges.where('courtNo').equals(courtNo).first()
      ),
      { initialValue: undefined }
    );
  }

  /**
   * Create / update
   */
  async save(item: Omit<CourtServiceJudge, 'id'>): Promise<number> {
    return db.courtServiceJudges.add(item as CourtServiceJudge);
  }

  async update(
    id: number,
    changes: Partial<CourtServiceJudge>
  ): Promise<number> {
    return db.courtServiceJudges.update(id, changes);
  }

  async delete(id: number): Promise<void> {
    await db.courtServiceJudges.delete(id);
  }
}
