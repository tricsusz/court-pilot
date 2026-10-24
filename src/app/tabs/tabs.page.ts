import {
  Component,
  EnvironmentInjector,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { gridOutline, peopleOutline, settingsOutline } from 'ionicons/icons';
import { TranslatePipe } from '../i18n/translation.pipe';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, TranslatePipe]
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({ gridOutline, peopleOutline, settingsOutline });
  }
}
