import { Injectable } from '@angular/core';
import { FEATURE_FLAG_DEFAULTS, FeatureFlag } from '@domain/models/feature-flag.model';
import { FeatureFlagRepository } from '@domain/repositories/feature-flag.repository';

@Injectable({ providedIn: 'root' })
export class DefaultFeatureFlagService implements FeatureFlagRepository {
  public initialize(): Promise<void> {
    return Promise.resolve();
  }

  public refresh(): Promise<void> {
    return Promise.resolve();
  }

  public isEnabled(flag: FeatureFlag): boolean {
    return FEATURE_FLAG_DEFAULTS[flag];
  }
}
