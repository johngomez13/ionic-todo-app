import { InjectionToken, Provider, Type } from '@angular/core';
import { environment } from '@env/environment';
import { FeatureFlagRepository } from '@domain/repositories/feature-flag.repository';
import { DefaultFeatureFlagService } from '@infrastructure/remote-config/default-feature-flag.service';
import { RemoteConfigNativeService } from '@infrastructure/remote-config/remote-config-native.service';
import { RemoteConfigWebService } from '@infrastructure/remote-config/remote-config-web.service';

export const FEATURE_FLAG_REPOSITORY = new InjectionToken<FeatureFlagRepository>('FeatureFlagRepository');

const runsInsideCordova = (): boolean => 'cordova' in globalThis;
const hasFirebaseConfig = (): boolean => environment.firebase.apiKey.length > 0;

const selectImplementation = (): Type<FeatureFlagRepository> => {
  if (!hasFirebaseConfig()) return DefaultFeatureFlagService;

  return runsInsideCordova() ? RemoteConfigNativeService : RemoteConfigWebService;
};

export const provideFeatureFlagRepository = (): Provider => ({
  provide: FEATURE_FLAG_REPOSITORY,
  useClass: selectImplementation(),
});
