import { Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { db, Settings } from 'db';
import { liveQuery } from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  constructor() {
    void this.ensureSettings();
  }

  /**
   * Reactive settings signal
   */
  readonly settings = toSignal<Settings | undefined>(
    liveQuery(() => db.settings.get(1)),
    { initialValue: undefined }
  );

  /**
   * Update settings
   */
  async update(changes: Partial<Omit<Settings, 'id'>>): Promise<void> {
    if (
      changes.numberOfCourts !== undefined &&
      (!Number.isSafeInteger(changes.numberOfCourts) ||
        changes.numberOfCourts < 1)
    )
      return;

    await db.transaction(
      'rw',
      [
        db.settings,
        db.courtUmpires,
        db.courtServiceJudges,
        db.waitingServiceJudges
      ],
      async () => {
        await this.ensureSettings();
        const current = (await db.settings.get(1))!;
        const next = { ...current, ...changes };
        if (!next.withServiceJudge) next.waitingListQuickButtons = false;
        await db.courtUmpires
          .where('courtNo')
          .above(next.numberOfCourts)
          .delete();
        await db.courtServiceJudges
          .where('courtNo')
          .above(next.numberOfCourts)
          .delete();
        if (!next.withServiceJudge) {
          await db.courtServiceJudges.clear();
          await db.waitingServiceJudges.clear();
        }
        await db.settings.put(next);
      }
    );
  }

  private async ensureSettings() {
    await db.transaction('rw', db.settings, async () => {
      if (await db.settings.get(1)) return;
      await db.settings.put({
        id: 1,
        numberOfCourts: 5,
        withServiceJudge: true,
        showAlert: true,
        waitingListQuickButtons: false
      });
    });
  }
}
