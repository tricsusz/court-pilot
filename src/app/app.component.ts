import { Component, inject } from '@angular/core';
import {
  AlertController,
  IonApp,
  IonRouterOutlet
} from '@ionic/angular/standalone';
import { check } from '@tauri-apps/plugin-updater';
import { isTauri } from '@tauri-apps/api/core';
import { relaunch } from '@tauri-apps/plugin-process';
import { TranslationService } from './i18n/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet]
})
export class AppComponent {
  readonly alertController: AlertController = inject(AlertController);
  readonly translationService: TranslationService = inject(TranslationService);

  constructor() {
    this.checkForUpdates();
  }

  private async checkForUpdates(): Promise<void> {
    if (!isTauri()) {
      return;
    }

    try {
      const update = await check();

      if (update) {
        const alert = await this.alertController.create({
          header: this.translationService.translate('updateAvailable'),
          message: this.translationService.translate('newVersion', {
            version: update.version
          }),
          buttons: [
            {
              text: 'OK',
              handler: async () => {
                try {
                  await update.downloadAndInstall();
                  await relaunch();
                } catch (error) {
                  console.error('Failed to install update:', error);
                }
              }
            }
          ]
        });

        await alert.present();
        return;
      }

      console.log('No updates available.');
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }
}
