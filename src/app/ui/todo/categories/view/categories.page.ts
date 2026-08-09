import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
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
import { checkmarkOutline, closeOutline, createOutline, trashOutline } from 'ionicons/icons';
import { normalizeCategoryName } from '@domain/models/category.model';
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from '@ui/todo/shared/constants/category-colors.const';
import {
  resolveCategoriesEmptyMessage,
  resolveNameError,
  toCategoryView,
} from '@ui/todo/shared/helpers/category-view.helper';
import { CategoryView } from '@ui/todo/shared/models/category-view.model';
import { TodoStore } from '@ui/todo/state/store/todo.store';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
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
export default class CategoriesPage {
  private readonly store = inject(TodoStore);
  public readonly colors = CATEGORY_COLORS;
  public readonly draftName = signal('');
  public readonly draftColor = signal(DEFAULT_CATEGORY_COLOR);
  public readonly editingId = signal<string | null>(null);
  public readonly editingName = signal('');
  public readonly categories = computed<CategoryView[]>(() => this.store.categories().map(toCategoryView));
  public readonly emptyMessage = computed(() => resolveCategoriesEmptyMessage(this.store.categoryCount()));
  public readonly nameError = computed(() => resolveNameError(this.draftName(), this.store.categories()));
  public readonly canAddCategory = computed(
    () => normalizeCategoryName(this.draftName()).length > 0 && this.nameError() === null,
  );
  public readonly editingError = computed(() =>
    resolveNameError(this.editingName(), this.store.categories(), this.editingId()),
  );
  public readonly canConfirmRename = computed(
    () => normalizeCategoryName(this.editingName()).length > 0 && this.editingError() === null,
  );

  constructor() {
    addIcons({ checkmarkOutline, closeOutline, createOutline, trashOutline });
  }

  public onDraftNameChange(value: string): void {
    this.draftName.set(value);
  }

  public onDraftColorChange(event: Event): void {
    const { value } = (event as CustomEvent<{ value?: unknown }>).detail;

    if (typeof value === 'string') this.draftColor.set(value);
  }

  public addCategory(): void {
    if (!this.canAddCategory()) return;

    this.store.addCategory(this.draftName(), this.draftColor());
    this.draftName.set('');
  }

  public startRename(category: CategoryView): void {
    this.editingId.set(category.id);
    this.editingName.set(category.name);
  }

  public onEditingNameChange(value: string): void {
    this.editingName.set(value);
  }

  public confirmRename(): void {
    const id = this.editingId();

    if (id === null || !this.canConfirmRename()) return;

    this.store.renameCategory(id, this.editingName());
    this.cancelRename();
  }

  public cancelRename(): void {
    this.editingId.set(null);
    this.editingName.set('');
  }

  public removeCategory(id: string): void {
    if (this.editingId() === id) this.cancelRename();

    this.store.removeCategory(id);
  }
}
