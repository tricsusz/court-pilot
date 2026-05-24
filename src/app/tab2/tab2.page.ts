import { Component, ViewChild } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { UmpireService } from '../services/umpire.service';
import { Umpire } from 'db';
import { addIcons } from 'ionicons';
import { add, trash } from 'ionicons/icons';
import { OverlayEventDetail } from '@ionic/core/components';
import { FormsModule } from '@angular/forms';
import { FullnamePipe } from '../fullname-pipe';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  providers: [FullnamePipe],
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
    FullnamePipe
  ]
})
export class Tab2Page {
  @ViewChild(IonModal) modal!: IonModal;

  public readonly umpires = this.umpireService.umpires;

  public lastName: string = '';
  public firstName: string = '';
  public country: string = '';
  public gender: string = '';

  public genders = [
    { label: 'gender.male', code: 'M' },
    { label: 'gender.female', code: 'W' }
  ];

  constructor(
    private umpireService: UmpireService,
    private alertController: AlertController,
    private fullnamePipe: FullnamePipe
  ) {
    addIcons({ add, trash });
  }

  public async onWillDismiss(event: CustomEvent<OverlayEventDetail>) {
    if (event.detail.role !== 'confirm') {
      return;
    }

    const newUmpire: Umpire = event.detail.data;

    await this.umpireService.create({
      firstName: newUmpire.firstName,
      lastName: newUmpire.lastName,
      country: newUmpire.country,
      gender: newUmpire.gender
    });
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(
      {
        lastName: this.lastName,
        firstName: this.firstName,
        country: this.country,
        gender: this.gender
      },
      'confirm'
    );
  }

  isValidUmpire(): boolean {
    return this.lastName !== '' && this.firstName !== '';
  }

  public async showDeleteConfirmation(umpire: Umpire) {
    const alert = await this.alertController.create({
      header: 'Megerősítés',
      subHeader: 'Biztos törlöd a következő játékvezetőt?',
      message: this.fullnamePipe.transform(umpire),
      buttons: [
        {
          text: 'Nem',
          role: 'cancel'
        },
        {
          text: 'Igen',
          role: 'confirm',
          handler: () => {
            // TODO: also remove from first tab
            this.removeUmpire(umpire);
          }
        }
      ]
    });

    await alert.present();
  }

  private removeUmpire(umpire: Umpire): void {
    this.umpireService.delete(umpire.id);
  }
}
