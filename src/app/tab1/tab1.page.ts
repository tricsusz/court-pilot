import { Component, computed, effect, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonCol,
  IonRow,
  IonList,
  IonItem,
  IonLabel,
  IonIcon
} from '@ionic/angular/standalone';
import { SettingsService } from '../services/settings-service';
import { UmpireService } from '../services/umpire.service';
import { Umpire, WaitingAsServiceJudge, WaitingAsUmpire } from 'db';
import { WaitingUmpiresService } from '../services/waiting-umpires.service';
import { WaitingServiceJudgesService } from '../services/waiting-service-judges.service';
import { FullnamePipe } from '../fullname-pipe';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  DragDropModule
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { CourtUmpireService } from '../services/court.umpire.service';
import { CourtServiceJudgeService } from '../services/court.service.judge.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonLabel,
    IonItem,
    IonList,
    IonRow,
    IonCol,
    IonGrid,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    FullnamePipe,
    CdkDropList,
    CdkDrag,
    CommonModule,
    DragDropModule
  ]
})
export class Tab1Page {
  readonly settingsService = inject(SettingsService);
  readonly umpireService = inject(UmpireService);
  readonly waitingUmpireService = inject(WaitingUmpiresService);
  readonly waitingServiceJudgeService = inject(WaitingServiceJudgesService);
  readonly courtUmpireService = inject(CourtUmpireService);
  readonly courtServiceJudgeService = inject(CourtServiceJudgeService);

  /**
   * Raw signals from services
   */
  readonly settings = this.settingsService.settings;

  readonly _umpires = this.umpireService.umpires;

  readonly _waitingUmpires = this.waitingUmpireService.waitingUmpires;

  readonly _waitingServiceJudges =
    this.waitingServiceJudgeService.waitingServiceJudges;

  readonly _courtUmpires = this.courtUmpireService.umpires;

  readonly _courtServiceJudges = this.courtServiceJudgeService.umpires;

  /**
   * Fast O(1) umpire lookup
   */
  readonly umpireMap = computed(() => {
    return new Map<number, Umpire>(this._umpires().map((u) => [u.id, u]));
  });

  /**
   * Waiting umpire IDs
   */
  readonly waitingUmpireIds = computed(() => {
    return new Set(this._waitingUmpires().map((w) => w.umpireId));
  });

  /**
   * Waiting service judge IDs
   */
  readonly waitingServiceJudgeIds = computed(() => {
    return new Set(this._waitingServiceJudges().map((w) => w.serviceJudgeId));
  });

  /**
   * Court umpire IDs
   */
  readonly courtUmpireIds = computed(() => {
    return new Set(
      this._courtUmpires()
        .map((c) => c.umpireId)
        .filter((id): id is number => id !== null)
    );
  });

  /**
   * Court service judge IDs
   */
  readonly courtServiceJudgeIds = computed(() => {
    return new Set(
      this._courtServiceJudges()
        .map((c) => c.umpireId)
        .filter((id): id is number => id !== null)
    );
  });

  /**
   * Umpires waiting as umpire
   */
  readonly waitingUmpires = computed(() => {
    const umpireMap = this.umpireMap();

    return this._waitingUmpires()
      .map((wu) => umpireMap.get(wu.umpireId))
      .filter((u): u is Umpire => !!u);
  });

  /**
   * Umpires waiting as service judge
   */
  readonly waitingServiceJudges = computed(() => {
    const umpireMap = this.umpireMap();

    return this._waitingServiceJudges()
      .map((wsj) => umpireMap.get(wsj.serviceJudgeId))
      .filter((u): u is Umpire => !!u);
  });

  /**
   * Court umpires
   */
  readonly courtUmpires = computed(() => {
    const umpireMap = this.umpireMap();

    return this._courtUmpires()
      .map((cu) => {
        if (cu.umpireId == null) {
          return undefined;
        }

        return umpireMap.get(cu.umpireId);
      })
      .filter((u): u is Umpire => !!u);
  });

  /**
   * Court service judges
   */
  readonly courtServiceJudges = computed(() => {
    const umpireMap = this.umpireMap();

    return this._courtServiceJudges()
      .map((csj) => {
        if (csj.umpireId == null) {
          return undefined;
        }

        return umpireMap.get(csj.umpireId);
      })
      .filter((u): u is Umpire => !!u);
  });

  /**
   * Umpires resting
   */
  readonly onRest = computed(() => {
    const waitingUmpireIds = this.waitingUmpireIds();

    const waitingServiceJudgeIds = this.waitingServiceJudgeIds();

    const courtUmpireIds = this.courtUmpireIds();

    const courtServiceJudgeIds = this.courtServiceJudgeIds();

    return this._umpires().filter((umpire) => {
      return (
        !waitingUmpireIds.has(umpire.id) &&
        !waitingServiceJudgeIds.has(umpire.id) &&
        !courtUmpireIds.has(umpire.id) &&
        !courtServiceJudgeIds.has(umpire.id)
      );
    });
  });

  /**
   * Court -> umpire map
   */
  readonly umpireByCourt = computed(() => {
    const map = new Map<number, Umpire>();

    const umpireMap = this.umpireMap();

    for (const item of this._courtUmpires()) {
      if (item.umpireId == null) {
        continue;
      }

      const umpire = umpireMap.get(item.umpireId);

      if (!umpire) {
        continue;
      }

      map.set(item.courtNo, umpire);
    }

    return map;
  });

  /**
   * Court -> service judge map
   */
  readonly serviceJudgeByCourt = computed(() => {
    const map = new Map<number, Umpire>();

    const umpireMap = this.umpireMap();

    for (const item of this._courtServiceJudges()) {
      if (item.umpireId == null) {
        continue;
      }

      const umpire = umpireMap.get(item.umpireId);

      if (!umpire) {
        continue;
      }

      map.set(item.courtNo, umpire);
    }

    return map;
  });

  /**
   * Court indexes for template
   */
  readonly courtIndexes = computed(() => {
    const count = this.settings()?.numberOfCourts ?? 0;

    return Array.from({ length: count }, (_, i) => i + 1);
  });

  dropToRest(event: CdkDragDrop<Umpire[]>) {
    console.log('drop to rest');
    if (event.previousContainer === event.container) {
      return;
    } else {
      const comingFrom = event.previousContainer.id;
      const umpireToMove = event.item.data;
      this.removeFromOriginalPlace(umpireToMove, comingFrom);
    }
  }

  dropToWaitingServiceJudge(event: CdkDragDrop<Umpire[]>) {
    if (event.previousContainer === event.container) {
      // TODO
    } else {
      const comingFrom = event.previousContainer.id;
      const umpireToMove = event.item.data;
      this.waitingServiceJudgeService.add(umpireToMove.id);

      this.removeFromOriginalPlace(umpireToMove, comingFrom);
    }
  }

  dropToWaitingUmpire(event: CdkDragDrop<Umpire[]>) {
    console.log(
      event.container.data,
      event.previousContainer.data,
      event.previousContainer.id,
      event.container.id
    );
    if (event.previousContainer === event.container) {
      // TODO
    } else {
      const comingFrom = event.previousContainer.id;
      const umpireToMove = event.item.data;
      this.waitingUmpireService.add(umpireToMove.id);

      this.removeFromOriginalPlace(umpireToMove, comingFrom);
    }
  }

  dropToUmpire(event: CdkDragDrop<Umpire[]>, courtNo: number) {
    // TODO: stop dropping if there is already another umpire

    const comingFrom = event.previousContainer.id;
    const umpireToMove = event.item.data;
    this.courtUmpireService.save({ umpireId: umpireToMove.id, courtNo });

    this.removeFromOriginalPlace(umpireToMove, comingFrom);
  }

  dropToServiceJudge(event: CdkDragDrop<Umpire[]>, courtNo: number) {
    // TODO: stop dropping if there is already another umpire

    const comingFrom = event.previousContainer.id;
    const umpireToMove = event.item.data;
    this.courtServiceJudgeService.save({ umpireId: umpireToMove.id, courtNo });

    this.removeFromOriginalPlace(umpireToMove, comingFrom);
  }

  private removeFromOriginalPlace(
    umpireToMove: Umpire,
    comingFrom: string
  ): void {
    if ('list-waiting-service-judges' === comingFrom) {
      this.waitingServiceJudgeService.removeByUmpireId(umpireToMove.id);
    }

    if ('list-waiting-umpires' === comingFrom) {
      this.waitingUmpireService.removeByUmpireId(umpireToMove.id);
    }

    if (comingFrom.startsWith('court-umpire')) {
      this.courtUmpireService.removeByUmpireId(umpireToMove.id);
    }

    if (comingFrom.startsWith('court-service-judge')) {
      this.courtServiceJudgeService.removeByUmpireId(umpireToMove.id);
    }
  }
}
