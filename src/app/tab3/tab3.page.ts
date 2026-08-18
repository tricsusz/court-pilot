import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonToggle,
  IonInput,
  IonGrid,
  IonCol,
  IonRow
} from '@ionic/angular/standalone';
import { SettingsService } from '../services/settings-service';
import { CourtUmpireService } from '../services/court.umpire.service';
import { CourtServiceJudgeService } from '../services/court.service.judge.service';
import { CourtServiceJudge } from 'db';
import { WaitingServiceJudgesService } from '../services/waiting-service-judges.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonRow,
    IonCol,
    IonGrid,
    IonInput,
    IonToggle,
    IonItem,
    IonList,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent
  ]
})
export class Tab3Page {
  readonly settingsService = inject(SettingsService);
  readonly courtUmpireService = inject(CourtUmpireService);
  readonly courtServiceJudgeService = inject(CourtServiceJudgeService);
  readonly waitingServiceJudgeService = inject(WaitingServiceJudgesService);

  readonly settings = this.settingsService.settings;

  async updateNumberOfCourts(event: CustomEvent): Promise<void> {
    this.courtUmpireService
      .umpires()
      .filter((cu) => {
        return cu.courtNo > Number(event.detail.value);
      })
      .map((cu) => {
        this.courtUmpireService.delete(cu.id);
      });

    this.courtServiceJudgeService
      .umpires()
      .filter((cu) => {
        return cu.courtNo > Number(event.detail.value);
      })
      .map((cu) => {
        this.courtServiceJudgeService.delete(cu.id);
      });

    await this.settingsService.update({
      numberOfCourts: Number(event.detail.value)
    });
  }

  async updateWithServiceJudge(event: CustomEvent): Promise<void> {
    await this.settingsService.update({
      withServiceJudge: event.detail.checked
    });

    if (!event.detail.checked) {
      this.courtServiceJudgeService.umpires().map((csj: CourtServiceJudge) => {
        this.courtServiceJudgeService.delete(csj.id);
      });


      this.waitingServiceJudgeService.waitingServiceJudges().map((wsj) => {
        this.waitingServiceJudgeService.remove(wsj.id);
      });
    }
  }

  async updateShowAlert(event: CustomEvent): Promise<void> {
    await this.settingsService.update({
      showAlert: event.detail.checked
    });
  }
}
