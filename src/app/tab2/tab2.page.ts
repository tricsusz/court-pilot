import {
  Component,
  inject,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonModal,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonList,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  AlertController
} from '@ionic/angular';
import { UmpireService } from '../services/umpire.service';
import { Umpire } from 'db';
import { addIcons } from 'ionicons';
import { add, trash } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { FullnamePipe } from '../fullname-pipe';
import { TranslatePipe } from '../i18n/translation.pipe';
import { TranslationKey } from '../i18n/translations';
import { TranslationService } from '../i18n/translation.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  providers: [FullnamePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    IonLabel,
    IonCol,
    IonRow,
    IonGrid,
    IonInput,
    IonItem,
    IonModal,
    IonIcon,
    IonButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    FormsModule,
    IonSelect,
    IonSelectOption,
    IonList,
    FullnamePipe,
    TranslatePipe
  ]
})
export class Tab2Page {
  readonly translationService = inject(TranslationService);

  @ViewChild(IonModal) modal!: IonModal;

  public readonly umpireService = inject(UmpireService);
  public readonly fullnamePipe = inject(FullnamePipe);
  public readonly alertController = inject(AlertController);

  public readonly umpires = this.umpireService.umpires;

  saving = false;

  public lastName: string = '';
  public firstName: string = '';
  public country: string = '';
  public gender: string = '';

  public readonly genders: { label: TranslationKey; code: string }[] = [
    { label: 'male', code: 'M' },
    { label: 'female', code: 'W' }
  ];

  constructor() {
    addIcons({ add, trash });
  }

  cancel(): Promise<boolean> {
    return this.modal.dismiss(null, 'cancel');
  }

  async confirm(): Promise<void> {
    if (this.saving || !this.isValidUmpire()) return;
    this.saving = true;
    try {
      await this.umpireService.create({
        lastName: this.lastName.trim(),
        firstName: this.firstName.trim(),
        country: this.country.trim(),
        gender: this.gender
      });
    } catch (error) {
      console.error('Failed to save court official:', error);
      const alert = await this.alertController.create({
        header: this.translationService.translate('saveFailed'),
        buttons: ['OK']
      });
      await alert.present();
      return;
    } finally {
      this.saving = false;
    }
    await this.modal.dismiss(null, 'confirm');
    this.lastName = '';
    this.firstName = '';
    this.country = '';
    this.gender = '';
  }

  isValidUmpire(): boolean {
    return this.lastName.trim().length > 0 && this.firstName.trim().length > 0;
  }

  public async showDeleteConfirmation(umpire: Umpire): Promise<void> {
    const alert = await this.alertController.create({
      header: this.translationService.translate('confirmation'),
      subHeader: this.translationService.translate('confirmDeleteUmpire'),
      message: this.fullnamePipe.transform(umpire),
      buttons: [
        {
          text: this.translationService.translate('no'),
          role: 'cancel'
        },
        {
          text: this.translationService.translate('yes'),
          role: 'confirm',
          handler: () => this.umpireService.delete(umpire.id)
        }
      ]
    });

    await alert.present();
  }
}
