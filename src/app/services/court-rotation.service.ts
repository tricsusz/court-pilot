import { inject, Injectable } from '@angular/core';
import { db, WaitingRole } from 'db';
import { WaitingUmpiresService } from './waiting-umpires.service';
import { WaitingServiceJudgesService } from './waiting-service-judges.service';

/** Coordinates state changes atomically; pages only supply the requested action. */
@Injectable({ providedIn: 'root' })
export class CourtRotationService {
  private readonly umpires = inject(WaitingUmpiresService);
  private readonly judges = inject(WaitingServiceJudgesService);

  private transaction(action: () => Promise<void>): Promise<void> {
    return db.transaction(
      'rw',
      [
        db.settings,
        db.umpires,
        db.waitingUmpires,
        db.waitingServiceJudges,
        db.courtUmpires,
        db.courtServiceJudges
      ],
      action
    );
  }

  private async removeOfficial(id: number): Promise<void> {
    await db.waitingUmpires.where('umpireId').equals(id).delete();
    await db.waitingServiceJudges.where('serviceJudgeId').equals(id).delete();
    await db.courtUmpires.where('umpireId').equals(id).delete();
    await db.courtServiceJudges.where('umpireId').equals(id).delete();
    await this.umpires.reinitOrders();
    await this.judges.reinitOrders();
    await db.umpires.update(id, { returnToQueue: undefined });
  }

  async moveToQueue(
    id: number,
    role: WaitingRole,
    position: number
  ): Promise<void> {
    await this.transaction(async () => {
      if (!(await db.umpires.get(id))) return;
      if (
        role === 'serviceJudge' &&
        !(await db.settings.get(1))?.withServiceJudge
      )
        return;
      await this.removeOfficial(id);
      if (role === 'umpire') await this.umpires.add(id, position);
      else await this.judges.add(id, position);
    });
  }

  async moveToRest(id: number): Promise<void> {
    await this.transaction(async () => {
      await this.removeOfficial(id);
    });
  }

  async moveToCourt(
    id: number,
    role: WaitingRole,
    courtNo: number
  ): Promise<void> {
    await this.transaction(async () => {
      const settings = await db.settings.get(1);
      if (
        !settings ||
        !Number.isInteger(courtNo) ||
        courtNo < 1 ||
        courtNo > settings.numberOfCourts ||
        (role === 'serviceJudge' && !settings.withServiceJudge) ||
        !(await db.umpires.get(id))
      )
        return;
      const table = role === 'umpire' ? db.courtUmpires : db.courtServiceJudges;
      if (await table.where('courtNo').equals(courtNo).count()) return;
      await this.removeOfficial(id);
      await table.add({ umpireId: id, courtNo });
    });
  }

  async assignNext(
    courtNo: number,
    expectedUmpireId: number,
    expectedJudgeId?: number
  ): Promise<void> {
    await this.transaction(async () => {
      const settings = await db.settings.get(1);
      if (
        !settings ||
        settings.withServiceJudge !== (expectedJudgeId !== undefined) ||
        !Number.isInteger(courtNo) ||
        courtNo < 1 ||
        courtNo > settings.numberOfCourts
      )
        return;
      if (
        (await db.courtUmpires.where('courtNo').equals(courtNo).count()) ||
        (await db.courtServiceJudges.where('courtNo').equals(courtNo).count())
      )
        return;
      const umpire = await this.umpires.getCurrentUmpire();
      const judge = settings.withServiceJudge
        ? await this.judges.getCurrentUmpire()
        : undefined;
      // A confirmation must never assign different officials after the queues change.
      if (
        !umpire ||
        umpire.id !== expectedUmpireId ||
        (settings.withServiceJudge &&
          (!judge || judge.id !== expectedJudgeId || judge.id === umpire.id))
      )
        return;
      await this.removeOfficial(umpire.id);
      if (judge) await this.removeOfficial(judge.id);
      await db.courtUmpires.add({ courtNo, umpireId: umpire.id });
      if (judge)
        await db.courtServiceJudges.add({ courtNo, umpireId: judge.id });
    });
  }

  async rotate(
    courtNo: number,
    expectedUmpireId: number,
    expectedJudgeId?: number
  ): Promise<void> {
    await this.transaction(async () => {
      const settings = await db.settings.get(1);
      if (
        !settings ||
        settings.withServiceJudge !== (expectedJudgeId !== undefined)
      )
        return;
      const umpire = await db.courtUmpires
        .where('courtNo')
        .equals(courtNo)
        .first();
      const judge = settings.withServiceJudge
        ? await db.courtServiceJudges.where('courtNo').equals(courtNo).first()
        : undefined;
      if (
        !umpire ||
        umpire.umpireId !== expectedUmpireId ||
        (settings.withServiceJudge &&
          (!judge ||
            judge.umpireId !== expectedJudgeId ||
            judge.umpireId === umpire.umpireId))
      )
        return;
      if (
        !(await db.umpires.get(expectedUmpireId)) ||
        (judge?.umpireId != null && !(await db.umpires.get(judge.umpireId)))
      )
        return;
      await this.removeOfficial(expectedUmpireId);
      if (judge?.umpireId != null) {
        await this.removeOfficial(judge.umpireId);
        await this.umpires.add(judge.umpireId);
        await this.judges.add(expectedUmpireId);
      } else {
        await this.umpires.add(expectedUmpireId);
      }
    });
  }
}
