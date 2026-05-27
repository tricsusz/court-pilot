import { Component, effect, inject } from '@angular/core';
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
import { addIcons } from 'ionicons';
import { add } from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonIcon,
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

  public readonly settings = this.settingsService.settings;
  public readonly _umpires = this.umpireService.umpires;
  public readonly _waitingUmpires = this.waitingUmpireService.waitingUmpires;
  public readonly _waitingServiceJudges =
    this.waitingServiceJudgeService.waitingServiceJudges;

  public onRest: Umpire[] = [];
  public waitingUmpires: Umpire[] = [];
  public waitingServiceJudges: Umpire[] = [];

  constructor() {
    addIcons({ add });

    effect(() => {
      this.onRest = this._umpires().filter((umpire) => {
        return (
          !this.isUmpireOnCourt(umpire) &&
          !this.isWaitingUmpire(umpire) &&
          !this.isWaitingServiceJudge(umpire)
        );
      });

      this.waitingUmpires = this._waitingUmpires()
        .map((_wa) => {
          return this._umpires().find((u) => u.id === _wa.umpireId);
        })
        .filter((u) => typeof u !== 'undefined');

      this.waitingServiceJudges = this._waitingServiceJudges()
        .map((_wsj) => {
          return this._umpires().find((u) => u.id === _wsj.serviceJudgeId);
        })
        .filter((u) => typeof u !== 'undefined');
    });
  }

  private isUmpireOnCourt(umpire: Umpire): boolean {
    return false;
  }

  private isWaitingUmpire(umpire: Umpire): boolean {
    return (
      typeof this._waitingUmpires().find((wu) => wu.umpireId === umpire.id) !==
      'undefined'
    );
  }

  private isWaitingServiceJudge(umpire: Umpire): boolean {
    return (
      typeof this._waitingServiceJudges().find(
        (wsj) => wsj.serviceJudgeId === umpire.id
      ) !== 'undefined'
    );
  }

  dropToRest(event: CdkDragDrop<Umpire[]>) {
    if (event.previousContainer === event.container) {
      return;
    } else {
      const comingFrom = event.previousContainer.id;
      const umpireToMove = event.item.data;
      if ('list-waiting-service-judges' === comingFrom) {
        // Remove from waiting service judges
        this.waitingServiceJudgeService.removeByUmpireId(umpireToMove.id);
      }

      if ('list-waiting-umpires' === comingFrom) {
        this.waitingUmpireService.removeByUmpireId(umpireToMove.id);
      }
    }
  }

  dropToWaitingServiceJudge(event: CdkDragDrop<Umpire[]>) {
    if (event.previousContainer === event.container) {
      // TODO
    } else {
      const comingFrom = event.previousContainer.id;
      const umpireToMove = event.item.data;
      this.waitingServiceJudgeService.add(umpireToMove.id);

      if ('list-waiting-umpires' === comingFrom) {
        this.waitingUmpireService.removeByUmpireId(umpireToMove.id);
      }
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

      if ('list-waiting-service-judges' === comingFrom) {
        // Remove from waiting service judges
        this.waitingServiceJudgeService.removeByUmpireId(umpireToMove.id);
      }
    }
  }
}
