import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
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
  IonRow,
  IonSelect,
  IonSelectOption,
  IonLabel
} from '@ionic/angular';
import { SettingsService } from '../services/settings-service';
import { TranslationService } from '../i18n/translation.service';
import { Language } from '../i18n/translations';
import type {
  InputCustomEvent,
  SelectCustomEvent,
  ToggleCustomEvent
} from '@ionic/angular';
import { TranslatePipe } from '../i18n/translation.pipe';
import { ThemePreference, ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
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
    IonContent,
    IonSelect,
    IonSelectOption,
    TranslatePipe,
    IonLabel
  ]
})
export class Tab3Page {
  readonly settingsService = inject(SettingsService);
  readonly translationService = inject(TranslationService);

  readonly themeService = inject(ThemeService);

  readonly settings = this.settingsService.settings;

  async updateNumberOfCourts(event: InputCustomEvent): Promise<void> {
    await this.settingsService.update({
      numberOfCourts: Number(event.detail.value)
    });
  }

  async updateWithServiceJudge(event: ToggleCustomEvent): Promise<void> {
    await this.settingsService.update({
      withServiceJudge: event.detail.checked
    });
  }

  async updateWaitingListQuickButtons(event: ToggleCustomEvent): Promise<void> {
    await this.settingsService.update({
      waitingListQuickButtons: event.detail.checked
    });
  }

  async updateShowAlert(event: ToggleCustomEvent): Promise<void> {
    await this.settingsService.update({
      showAlert: event.detail.checked
    });
  }

  updateTheme(event: SelectCustomEvent<ThemePreference>): void {
    this.themeService.setTheme(event.detail.value);
  }

  updateLanguage(event: SelectCustomEvent<Language>): void {
    this.translationService.setLanguage(event.detail.value);
  }
}
