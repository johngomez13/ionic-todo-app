import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { normalizeTitle } from '@domain/models/task.model';
import { TaskStatusFilter } from '@domain/services/task-filters';
import { formatPendingLabel, resolveEmptyMessage, toTaskView } from '@ui/tasks/shared/helpers/task-view.helper';
import { TaskStore } from '../state/task.store';
import { TaskView } from './model/task-view.model';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IonButton,
    IonCheckbox,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
  ],
})
export default class TasksPage {
  private readonly store = inject(TaskStore);
  public readonly draft = signal('');
  public readonly statusFilter = this.store.statusFilter;
  public readonly visibleTasks = computed<TaskView[]>(() => this.store.visibleTasks().map(toTaskView));
  public readonly canAddTask = computed(() => normalizeTitle(this.draft()).length > 0);
  public readonly pendingLabel = computed(() => formatPendingLabel(this.store.pendingCount()));
  public readonly emptyMessage = computed(() =>
    resolveEmptyMessage(this.store.tasks().length, this.visibleTasks().length),
  );

  constructor() {
    addIcons({ trashOutline });
  }

  public onDraftChange(value: string): void {
    this.draft.set(value);
  }

  public addTask(): void {
    if (!this.canAddTask()) return;

    this.store.addTask(this.draft());
    this.draft.set('');
  }

  public toggleTask(id: string): void {
    this.store.toggleTask(id);
  }

  public removeTask(id: string): void {
    this.store.removeTask(id);
  }

  public onFilterChange(event: Event): void {
    const { value } = (event as CustomEvent<{ value?: unknown }>).detail;

    if (value === 'all' || value === 'pending' || value === 'completed') this.setStatusFilter(value);
  }

  public setStatusFilter(filter: TaskStatusFilter): void {
    this.store.setStatusFilter(filter);
  }
}
