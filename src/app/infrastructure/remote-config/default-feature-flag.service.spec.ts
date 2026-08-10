import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FEATURE_FLAG_DEFAULTS } from '@domain/models/feature-flag.model';
import { DefaultFeatureFlagService } from './default-feature-flag.service';

describe('DefaultFeatureFlagService', () => {
  let service: DefaultFeatureFlagService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(DefaultFeatureFlagService);
  });

  it('should report the local default of every flag', () => {
    expect(service.isEnabled('ff_categories_enabled')).toBe(FEATURE_FLAG_DEFAULTS['ff_categories_enabled']);
  });

  it('should keep answering the same after initialize and refresh, because there is nothing remote', async () => {
    await service.initialize();
    await service.refresh();

    expect(service.isEnabled('ff_categories_enabled')).toBeTrue();
  });
});
