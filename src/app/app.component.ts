import { Component, inject } from '@angular/core';
import {
  AlertController,
  IonApp,
  IonRouterOutlet,
  LoadingController
} from '@ionic/angular/standalone';
import { check, DownloadEvent } from '@tauri-apps/plugin-updater';
import { isTauri } from '@tauri-apps/api/core';
import { platform } from '@tauri-apps/plugin-os';
import { relaunch } from '@tauri-apps/plugin-process';
import { TranslationService } from './i18n/translation.service';



@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet]
})
export class AppComponent {
  readonly alertController: AlertController = inject(AlertController);
  readonly loadingController: LoadingController = inject(LoadingController);
  readonly translationService: TranslationService = inject(TranslationService);

  constructor() {
    this.checkForUpdates();
  }

  private async checkForUpdates(): Promise<void> {
    if (!isTauri()) {
      return;
    }

    // Snap handles updates on Linux.
    if (platform() === 'linux') {
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
                const loading = await this.loadingController.create({
                  message:
                    this.translationService.translate('updateDownloading'),
                  spinner: 'crescent',
                  backdropDismiss: false
                });

                await loading.present();

                let downloaded = 0;
                let total = 0;

                try {
                  await update.downloadAndInstall((event: DownloadEvent) => {
                    switch (event.event) {
                      case 'Started':
                        total = event.data.contentLength ?? 0;
                        downloaded = 0;
                        break;

                      case 'Progress':
                        downloaded += event.data.chunkLength;

                        if (total > 0) {
                          const percent = Math.min(
                            100,
                            Math.round((downloaded / total) * 100)
                          );

                          loading.message = `${this.translationService.translate('updateDownloading')} ${percent}%`;
                        }

                        break;

                      case 'Finished':
                        loading.message =
                          this.translationService.translate('updateInstalling');
                        break;
                    }
                  });

                  await loading.dismiss();
                  await relaunch();
                } catch (error) {
                  console.error('Failed to install update:', error);

                  await loading.dismiss();

                  const errorAlert = await this.alertController.create({
                    header: this.translationService.translate('updateFailed'),
                    message: String(error),
                    buttons: ['OK']
                  });

                  await errorAlert.present();
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
