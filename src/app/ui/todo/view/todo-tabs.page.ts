import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkboxOutline, pricetagsOutline } from 'ionicons/icons';
import { FeatureFlagsService } from '@application/feature-flags/feature-flags.service';

@Component({
  selector: 'app-todo-tabs',
  templateUrl: './todo-tabs.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs],
})
export default class TodoTabsPage {
  private readonly flags = inject(FeatureFlagsService);
  public readonly categoriesEnabled = this.flags.categoriesEnabled;

  constructor() {
    addIcons({ checkboxOutline, pricetagsOutline });
    afterNextRender(() => {
      void this.flags.load();
    });
  }
}
