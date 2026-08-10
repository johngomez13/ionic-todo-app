import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { FEATURE_FLAG_DEFAULTS, FeatureFlag } from '@domain/models/feature-flag.model';
import { FeatureFlagRepository } from '@domain/repositories/feature-flag.repository';

@Injectable({ providedIn: 'root' })
export class RemoteConfigWebService implements FeatureFlagRepository {
  private values: Record<FeatureFlag, boolean> = { ...FEATURE_FLAG_DEFAULTS };
  private remoteConfig: import('firebase/remote-config').RemoteConfig | null = null;

  public async initialize(): Promise<void> {
    const [{ initializeApp }, { fetchAndActivate, getRemoteConfig, getValue }] = await Promise.all([
      import('firebase/app'),
      import('firebase/remote-config'),
    ]);

    const app = initializeApp(environment.firebase);
    const remoteConfig = getRemoteConfig(app);
    remoteConfig.defaultConfig = { ...FEATURE_FLAG_DEFAULTS };
    remoteConfig.settings.minimumFetchIntervalMillis = environment.remoteConfig.minimumFetchIntervalMillis;
    remoteConfig.settings.fetchTimeoutMillis = environment.remoteConfig.fetchTimeoutMillis;
    this.remoteConfig = remoteConfig;
    await fetchAndActivate(remoteConfig);
    this.values = { ff_categories_enabled: getValue(remoteConfig, 'ff_categories_enabled').asBoolean() };
  }

  public async refresh(): Promise<void> {
    if (this.remoteConfig === null) {
      await this.initialize();

      return;
    }

    const { fetchAndActivate, getValue } = await import('firebase/remote-config');
    await fetchAndActivate(this.remoteConfig);
    this.values = { ff_categories_enabled: getValue(this.remoteConfig, 'ff_categories_enabled').asBoolean() };
  }

  public isEnabled(flag: FeatureFlag): boolean {
    return this.values[flag];
  }
}
