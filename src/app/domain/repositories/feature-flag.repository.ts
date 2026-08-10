import { FeatureFlag } from '../models/feature-flag.model';

export interface FeatureFlagRepository {
  initialize(): Promise<void>;
  refresh(): Promise<void>;
  isEnabled(flag: FeatureFlag): boolean;
}
