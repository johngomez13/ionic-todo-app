import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkboxOutline, pricetagsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-todo-tabs',
  templateUrl: './todo-tabs.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs],
})
export default class TodoTabsPage {
  constructor() {
    addIcons({ checkboxOutline, pricetagsOutline });
  }
}
