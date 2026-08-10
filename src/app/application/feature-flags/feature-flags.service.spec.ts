import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FEATURE_FLAG_REPOSITORY } from '@application/providers/feature-flag.provider';
import { FeatureFlag } from '@domain/models/feature-flag.model';
import { FeatureFlagRepository } from '@domain/repositories/feature-flag.repository';
import { FeatureFlagsService } from './feature-flags.service';

class FakeFeatureFlagRepository implements FeatureFlagRepository {
  public initialized = 0;

  public refreshed = 0;

  constructor(private enabled: boolean) {}

  public initialize(): Promise<void> {
    this.initialized += 1;

    return Promise.resolve();
  }

  public refresh(): Promise<void> {
    this.refreshed += 1;

    return Promise.resolve();
  }

  public isEnabled(_flag: FeatureFlag): boolean {
    return this.enabled;
  }

  public flip(): void {
    this.enabled = !this.enabled;
  }
}

describe('FeatureFlagsService', () => {
  const setup = (enabled = true): { service: FeatureFlagsService; repository: FakeFeatureFlagRepository } => {
    const repository = new FakeFeatureFlagRepository(enabled);

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), { provide: FEATURE_FLAG_REPOSITORY, useValue: repository }],
    });

    return { service: TestBed.inject(FeatureFlagsService), repository };
  };

  it('should start from the local defaults, before asking anyone', () => {
    const { service, repository } = setup(false);

    expect(service.categoriesEnabled()).toBeTrue();
    expect(repository.initialized).toBe(0);
  });

  it('should adopt the remote value once loaded', async () => {
    const { service } = setup(false);

    await service.load();

    expect(service.categoriesEnabled()).toBeFalse();
  });

  it('should pick up a value that changes between refreshes', async () => {
    const { service, repository } = setup(true);
    await service.load();

    expect(service.categoriesEnabled()).toBeTrue();

    repository.flip();
    await service.refresh();

    expect(service.categoriesEnabled()).toBeFalse();
    expect(repository.refreshed).toBe(1);
  });
});
