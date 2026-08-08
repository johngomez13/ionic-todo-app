import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { TASK_REPOSITORY } from '@application/providers/task.provider';
import { Task, createTask, normalizeTitle, toggleCompletion } from '@domain/models/task.model';
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
    IonList,
    IonTitle,
    IonToolbar,
  ],
})
export default class TasksPage {
  private readonly taskRepository = inject(TASK_REPOSITORY);
  readonly tasks = signal<Task[]>(this.taskRepository.getAll());
  readonly draft = signal('');
  readonly isEmpty = computed(() => this.tasks().length === 0);
  readonly canAddTask = computed(() => normalizeTitle(this.draft()).length > 0);
  readonly taskViews = computed<TaskView[]>(() =>
    this.tasks().map((task) => ({ ...task, removeLabel: `Eliminar ${task.title}` })),
  );

  constructor() {
    addIcons({ trashOutline });
    effect(() => {
      this.taskRepository.save(this.tasks());
    });
  }

  onDraftChange(value: string): void {
    this.draft.set(value);
  }

  addTask(): void {
    const title = normalizeTitle(this.draft());

    if (title.length === 0) return;

    this.tasks.update((tasks) => [...tasks, createTask(title)]);
    this.draft.set('');
  }

  toggleTask(id: string): void {
    this.tasks.update((tasks) => tasks.map((task) => (task.id === id ? toggleCompletion(task) : task)));
  }

  removeTask(id: string): void {
    this.tasks.update((tasks) => tasks.filter((task) => task.id !== id));
  }
}
