import { Injectable } from '@angular/core';
import { FEATURE_FLAG_DEFAULTS, FeatureFlag } from '@domain/models/feature-flag.model';
import { FeatureFlagRepository } from '@domain/repositories/feature-flag.repository';

interface FirebasePlugin {
  fetchAndActivate(success: () => void, error: (message: string) => void): void;
  getValue(key: string, success: (value: string) => void, error: (message: string) => void): void;
}

const DEVICE_READY_TIMEOUT_MS = 5000;

@Injectable({ providedIn: 'root' })
export class RemoteConfigNativeService implements FeatureFlagRepository {
  private values: Record<FeatureFlag, boolean> = { ...FEATURE_FLAG_DEFAULTS };

  public async initialize(): Promise<void> {
    await this.deviceReady();
    await this.fetchAndActivate();
    await this.readFlags();
  }

  public async refresh(): Promise<void> {
    await this.initialize();
  }

  public isEnabled(flag: FeatureFlag): boolean {
    return this.values[flag];
  }

  private deviceReady(): Promise<void> {
    if (this.plugin() !== null) return Promise.resolve();

    return new Promise((resolve) => {
      const finish = (): void => {
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(finish, DEVICE_READY_TIMEOUT_MS);

      document.addEventListener('deviceready', finish, { once: true });
    });
  }

  private plugin(): FirebasePlugin | null {
    const candidate = (globalThis as { FirebasePlugin?: FirebasePlugin }).FirebasePlugin;

    return candidate ?? null;
  }

  private fetchAndActivate(): Promise<void> {
    const plugin = this.plugin();

    if (plugin === null) return Promise.resolve();

    return new Promise((resolve) => {
      plugin.fetchAndActivate(
        () => {
          resolve();
        },
        () => {
          resolve();
        },
      );
    });
  }

  private readFlags(): Promise<void> {
    const plugin = this.plugin();

    if (plugin === null) return Promise.resolve();

    return new Promise((resolve) => {
      plugin.getValue(
        'ff_categories_enabled',
        (value: string) => {
          this.values = { ff_categories_enabled: value === 'true' };
          resolve();
        },
        () => {
          resolve();
        },
      );
    });
  }
}
