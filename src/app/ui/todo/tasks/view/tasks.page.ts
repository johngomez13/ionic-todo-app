import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRadio,
  IonRadioGroup,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, chevronDownOutline, chevronForwardOutline, pricetagOutline, trashOutline } from 'ionicons/icons';
import { FeatureFlagsService } from '@application/feature-flags/feature-flags.service';
import { normalizeTitle } from '@domain/models/task.model';
import { ALL_CATEGORIES, WITHOUT_CATEGORY } from '@domain/services/task-filters';
import {
  buildCategoryAssignOptions,
  buildCategoryChips,
  completedOf,
  formatCompletedLabel,
  formatPendingLabel,
  pendingOf,
  resolveEmptyMessage,
  toTaskViews,
} from '@ui/todo/shared/helpers/task-view.helper';
import { CategoryChip, CategoryOption, TaskView } from '@ui/todo/shared/models/task-view.model';
import { TodoStore } from '@ui/todo/state/store/todo.store';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IonButton,
    IonCheckbox,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonRadio,
    IonRadioGroup,
    IonTitle,
    IonToolbar,
  ],
})
export default class TasksPage {
  private readonly store = inject(TodoStore);
  private readonly flags = inject(FeatureFlagsService);
  public readonly draft = signal('');
  public readonly isAdding = signal(false);
  public readonly showCompleted = signal(false);
  public readonly assigningId = signal<string | null>(null);
  public readonly categoryFilter = this.store.categoryFilter;
  public readonly categoriesEnabled = this.flags.categoriesEnabled;
  public readonly showsCategories = computed(() => this.categoriesEnabled() && this.store.categoryCount() > 0);
  public readonly chips = computed<CategoryChip[]>(() =>
    buildCategoryChips(this.store.categories(), this.store.pendingByCategory()),
  );
  public readonly assignOptions = computed<CategoryOption[]>(() => buildCategoryAssignOptions(this.store.categories()));
  private readonly visibleViews = computed<TaskView[]>(() =>
    toTaskViews(this.store.visibleTasks(), this.store.categories()),
  );
  public readonly pendingTasks = computed<TaskView[]>(() => pendingOf(this.visibleViews()) as TaskView[]);
  public readonly completedTasks = computed<TaskView[]>(() => completedOf(this.visibleViews()) as TaskView[]);
  public readonly hasCompleted = computed(() => this.completedTasks().length > 0);
  public readonly completedLabel = computed(() => formatCompletedLabel(this.completedTasks().length));
  public readonly pendingLabel = computed(() => formatPendingLabel(this.store.pendingCount()));
  public readonly showsCategoryOnRow = computed(
    () => this.showsCategories() && this.categoryFilter() === ALL_CATEGORIES,
  );
  public readonly emptyMessage = computed(() =>
    resolveEmptyMessage(this.store.tasks().length, this.pendingTasks().length, this.completedTasks().length),
  );
  public readonly canAddTask = computed(() => normalizeTitle(this.draft()).length > 0);

  constructor() {
    addIcons({ addOutline, chevronDownOutline, chevronForwardOutline, pricetagOutline, trashOutline });
  }

  public selectCategory(value: string): void {
    this.store.setCategoryFilter(value);
  }

  public startAdding(): void {
    this.isAdding.set(true);
  }

  public cancelAdding(): void {
    this.isAdding.set(false);
    this.draft.set('');
  }

  public onDraftChange(value: string): void {
    this.draft.set(value);
  }

  public addTask(): void {
    if (!this.canAddTask()) return;

    this.store.addTask(this.draft(), this.categoryForNewTask());
    this.draft.set('');
  }

  public toggleCompleted(): void {
    this.showCompleted.update((shown) => !shown);
  }

  public toggleTask(id: string): void {
    this.store.toggleTask(id);
  }

  public removeTask(id: string): void {
    if (this.assigningId() === id) this.cancelAssign();

    this.store.removeTask(id);
  }

  public startAssign(id: string): void {
    this.assigningId.set(id);
  }

  public cancelAssign(): void {
    this.assigningId.set(null);
  }

  public assignCategory(taskId: string, option: string): void {
    this.store.assignCategory(taskId, option === WITHOUT_CATEGORY ? null : option);
    this.cancelAssign();
  }

  public onAssignChange(taskId: string, event: Event): void {
    const { value } = (event as CustomEvent<{ value?: unknown }>).detail;

    if (typeof value === 'string') this.assignCategory(taskId, value);
  }

  private categoryForNewTask(): string | null {
    const active = this.categoryFilter();

    return active === ALL_CATEGORIES || active === WITHOUT_CATEGORY ? null : active;
  }
}
