import {
  Component,
  computed,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
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
  IonIcon,
  IonButton,
  AlertController
} from '@ionic/angular';
import { CourtRotationService } from '../services/court-rotation.service';
import { SettingsService } from '../services/settings-service';
import { UmpireService } from '../services/umpire.service';
import { Umpire } from 'db';
import { WaitingDutyService } from '../services/waiting-duty.service';
import { WaitingUmpiresService } from '../services/waiting-umpires.service';
import { WaitingServiceJudgesService } from '../services/waiting-service-judges.service';
import { FullnamePipe } from '../fullname-pipe';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  CdkDropListGroup
} from '@angular/cdk/drag-drop';
import { CourtUmpireService } from '../services/court.umpire.service';
import { CourtServiceJudgeService } from '../services/court.service.judge.service';
import { addIcons } from 'ionicons';
import { enterOutline, exitOutline } from 'ionicons/icons';
import { TranslatePipe } from '../i18n/translation.pipe';
import { TranslationService } from '../i18n/translation.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  providers: [FullnamePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    IonButton,
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
    CdkDragPlaceholder,
    CdkDropListGroup,
    TranslatePipe
  ]
})
export class Tab1Page {
  constructor() {
    addIcons({ exitOutline, enterOutline });
  }

  readonly waitingDutyService = inject(WaitingDutyService);

  readonly settingsService = inject(SettingsService);
  readonly umpireService = inject(UmpireService);
  readonly waitingUmpireService = inject(WaitingUmpiresService);
  readonly waitingServiceJudgeService = inject(WaitingServiceJudgesService);
  readonly courtUmpireService = inject(CourtUmpireService);
  readonly courtServiceJudgeService = inject(CourtServiceJudgeService);
  readonly translationService = inject(TranslationService);

  readonly rotationService = inject(CourtRotationService);

  private readonly alertController = inject(AlertController);
  private readonly fullnamePipe = inject(FullnamePipe);

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

  /**
   * Is service judge functionality enabled in settings.
   */
  readonly serviceJudgeEnabled = computed(() => {
    return this.settings()?.withServiceJudge ?? false;
  });

  readonly waitingQuickButtonsEnabled = computed(
    () =>
      this.serviceJudgeEnabled() && !!this.settings()?.waitingListQuickButtons
  );

  async changeWaitingDuty(umpire: Umpire, toRest: boolean): Promise<void> {
    if (!this.waitingQuickButtonsEnabled()) return;
    const destination = toRest ? 'rest' : umpire.returnToQueue;
    if (!destination) return;
    const move = () => this.waitingDutyService.move(umpire.id, destination);
    if (!this.settings()?.showAlert) {
      await move();
      return;
    }
    const alert = await this.alertController.create({
      header: this.translationService.translate('confirmation'),
      subHeader: this.translationService.translate(
        toRest ? 'confirmMoveOffDuty' : 'confirmReturnToQueue'
      ),
      message: this.fullnamePipe.transform(umpire),
      buttons: [
        { text: this.translationService.translate('no'), role: 'cancel' },
        {
          text: this.translationService.translate('yes'),
          role: 'confirm',
          handler: () => move()
        }
      ]
    });
    await alert.present();
  }

  async dropToRest(
    event: CdkDragDrop<Umpire[], Umpire[], Umpire>
  ): Promise<void> {
    if (event.previousContainer === event.container) return;
    const source = event.previousContainer.id;
    if (
      source === 'list-waiting-umpires' ||
      source === 'list-waiting-service-judges'
    ) {
      await this.waitingDutyService.moveToRest(event.item.data.id);
    } else {
      await this.rotationService.moveToRest(event.item.data.id);
    }
  }

  async dropToWaitingServiceJudge(
    event: CdkDragDrop<Umpire[], Umpire[], Umpire>
  ): Promise<void> {
    await this.rotationService.moveToQueue(
      event.item.data.id,
      'serviceJudge',
      event.currentIndex + 1
    );
  }

  async dropToWaitingUmpire(
    event: CdkDragDrop<Umpire[], Umpire[], Umpire>
  ): Promise<void> {
    await this.rotationService.moveToQueue(
      event.item.data.id,
      'umpire',
      event.currentIndex + 1
    );
  }

  async dropToUmpire(
    event: CdkDragDrop<(Umpire | undefined)[], unknown, Umpire>,
    courtNo: number
  ): Promise<void> {
    if (event.container.data.length) return;
    await this.rotationService.moveToCourt(
      event.item.data.id,
      'umpire',
      courtNo
    );
  }

  async dropToServiceJudge(
    event: CdkDragDrop<(Umpire | undefined)[], unknown, Umpire>,
    courtNo: number
  ): Promise<void> {
    if (event.container.data.length) return;
    await this.rotationService.moveToCourt(
      event.item.data.id,
      'serviceJudge',
      courtNo
    );
  }

  readonly canDropUmpire = (
    _drag: CdkDrag<Umpire>,
    drop: CdkDropList<(Umpire | undefined)[]>
  ): boolean => drop.data.length === 0;

  public async showRemoveConfirmation(courtNo: number) {
    const umpire = this.umpireByCourt().get(courtNo);
    const serviceJudge = this.serviceJudgeByCourt().get(courtNo);

    if (
      typeof umpire === 'undefined' ||
      (typeof serviceJudge === 'undefined' && this.serviceJudgeEnabled())
    ) {
      return;
    }

    if (!this.settings()?.showAlert) {
      await this.rotationService.rotate(courtNo, umpire.id, serviceJudge?.id);
      return;
    }

    const alert = await this.alertController.create({
      header: this.translationService.translate('courtConfirm', {
        courtNo
      }),

      subHeader: this.translationService.translate(
        serviceJudge ? 'removeUmpiresFromCourt' : 'removeUmpireFromCourt'
      ),

      cssClass: 'wide',

      message: `${this.fullnamePipe.transform(umpire)}${
        serviceJudge ? ' - ' : ''
      }${this.fullnamePipe.transform(serviceJudge)}`,

      buttons: [
        {
          text: this.translationService.translate('no'),
          role: 'cancel'
        },
        {
          text: this.translationService.translate('yes'),
          role: 'confirm',
          handler: () =>
            this.rotationService.rotate(courtNo, umpire.id, serviceJudge?.id)
        }
      ]
    });

    await alert.present();
  }

  public async showAddConfirmation(courtNo: number) {
    const umpire = await this.waitingUmpireService.getCurrentUmpire();
    const serviceJudge = this.serviceJudgeEnabled()
      ? await this.waitingServiceJudgeService.getCurrentUmpire()
      : undefined;

    if (
      typeof umpire === 'undefined' ||
      (typeof serviceJudge === 'undefined' && this.serviceJudgeEnabled())
    ) {
      return;
    }

    if (!this.settings()?.showAlert) {
      await this.rotationService.assignNext(
        courtNo,
        umpire.id,
        serviceJudge?.id
      );
      return;
    }

    const alert = await this.alertController.create({
      header: this.translationService.translate('courtConfirm', {
        courtNo
      }),

      cssClass: 'wide',

      subHeader: this.translationService.translate(
        serviceJudge ? 'sendUmpiresToCourt' : 'sendUmpireToCourt'
      ),

      message: this.translationService.translate(
        serviceJudge ? 'sendUmpiresMessage' : 'sendUmpireMessage',
        {
          umpire: this.fullnamePipe.transform(umpire),
          serviceJudge: this.fullnamePipe.transform(serviceJudge)
        }
      ),

      buttons: [
        {
          text: this.translationService.translate('no'),
          role: 'cancel'
        },
        {
          text: this.translationService.translate('yes'),
          role: 'confirm',
          handler: () =>
            this.rotationService.assignNext(
              courtNo,
              umpire.id,
              serviceJudge?.id
            )
        }
      ]
    });

    await alert.present();
  }
}
