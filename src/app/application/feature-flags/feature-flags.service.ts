import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { FEATURE_FLAG_DEFAULTS, FeatureFlag } from '@domain/models/feature-flag.model';
import { FEATURE_FLAG_REPOSITORY } from '@application/providers/feature-flag.provider';

type FeatureFlagValues = Readonly<Record<FeatureFlag, boolean>>;

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly repository = inject(FEATURE_FLAG_REPOSITORY);
  private readonly values = signal<FeatureFlagValues>(FEATURE_FLAG_DEFAULTS);
  public readonly categoriesEnabled: Signal<boolean> = computed(() => this.values()['ff_categories_enabled']);

  public async load(): Promise<void> {
    await this.repository.initialize();
    this.read();
  }

  public async refresh(): Promise<void> {
    await this.repository.refresh();
    this.read();
  }

  private read(): void {
    this.values.set({ ff_categories_enabled: this.repository.isEnabled('ff_categories_enabled') });
  }
}
