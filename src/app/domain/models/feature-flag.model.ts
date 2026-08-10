export type FeatureFlag = 'ff_categories_enabled';

export const FEATURE_FLAG_DEFAULTS: Readonly<Record<FeatureFlag, boolean>> = {
  ff_categories_enabled: true,
};
