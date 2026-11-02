import { Injectable, inject } from '@angular/core';
import { db, WaitingRole } from 'db';
import { WaitingUmpiresService } from './waiting-umpires.service';
import { WaitingServiceJudgesService } from './waiting-service-judges.service';

@Injectable({ providedIn: 'root' })
export class WaitingDutyService {
  private readonly umpires = inject(WaitingUmpiresService);
  private readonly judges = inject(WaitingServiceJudgesService);

  async moveToRest(officialId: number): Promise<void> {
    await this.moveOfficial(officialId, 'rest', false);
  }

  async move(
    officialId: number,
    destination: WaitingRole | 'rest'
  ): Promise<void> {
    await this.moveOfficial(officialId, destination, true);
  }

  private async moveOfficial(
    officialId: number,
    destination: WaitingRole | 'rest',
    requireQuickButtons: boolean
  ): Promise<void> {
    await db.transaction(
      'rw',
      [
        db.settings,
        db.umpires,
        db.waitingUmpires,
        db.waitingServiceJudges,
        db.courtUmpires,
        db.courtServiceJudges
      ],
      async () => {
        const settings = await db.settings.get(1);
        const official = await db.umpires.get(officialId);
        if (
          !official ||
          (requireQuickButtons &&
            (!settings?.withServiceJudge || !settings.waitingListQuickButtons))
        )
          return;
        const umpire = await db.waitingUmpires
          .where('umpireId')
          .equals(officialId)
          .first();
        const judge = await db.waitingServiceJudges
          .where('serviceJudgeId')
          .equals(officialId)
          .first();
        const onCourt =
          (await db.courtUmpires
            .where('umpireId')
            .equals(officialId)
            .count()) ||
          (await db.courtServiceJudges
            .where('umpireId')
            .equals(officialId)
            .count());
        if (onCourt) return;
        if (destination === 'rest') {
          if (!umpire && !judge) return;
          await db.umpires.update(officialId, {
            returnToQueue: umpire ? 'umpire' : 'serviceJudge'
          });
          await this.umpires.removeByUmpireId(officialId);
          await this.judges.removeByUmpireId(officialId);
        } else {
          if (umpire || judge || !official.returnToQueue) return;
          const role = official.returnToQueue;
          if (role === 'serviceJudge') await this.judges.add(officialId);
          else await this.umpires.add(officialId);
          await db.umpires.update(officialId, { returnToQueue: undefined });
        }
      }
    );
  }
}
