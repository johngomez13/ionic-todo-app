import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';
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

export interface Task {
  readonly id: string;
  title: string;
  completed: boolean;
}

const STORAGE_KEY = 'todo.tasks';

/**
 * Lee las tareas persistidas. Ante datos corruptos devuelve una lista vacía en lugar
 * de propagar la excepción: perder el estado guardado es preferible a que la
 * aplicación no arranque.
 */
function readStoredTasks(): Task[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (raw === null) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as Task[]) : [];
  } catch {
    return [];
  }
}

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
  readonly tasks = signal<Task[]>(readStoredTasks());

  draft = '';

  constructor() {
    addIcons({ trashOutline });

    // La persistencia se deriva de la lista en vez de repetirse en cada operación,
    // de modo que ninguna mutación futura pueda olvidarse de guardar.
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks()));
    });
  }

  addTask(): void {
    const title = this.draft.trim();

    if (title.length === 0) {
      return;
    }

    this.tasks.update((tasks) => [...tasks, { id: crypto.randomUUID(), title, completed: false }]);
    this.draft = '';
  }

  toggleTask(id: string): void {
    this.tasks.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  }

  removeTask(id: string): void {
    this.tasks.update((tasks) => tasks.filter((task) => task.id !== id));
  }
}
