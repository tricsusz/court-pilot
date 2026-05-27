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
    const current = await db.settings.get(1);

    if (!current) {
      return;
    }

    await db.settings.update(1, changes);
  }

  private async ensureSettings() {
    const existing = await db.settings.get(1);

    if (!existing) {
      await db.settings.put({
        id: 1,
        numberOfCourts: 5,
        withServiceJudge: true
      });
    }
  }
}
