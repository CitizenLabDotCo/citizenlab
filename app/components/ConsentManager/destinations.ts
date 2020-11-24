import { isFeatureActive } from 'components/FeatureFlag';
import { ITenantData } from 'services/tenant';
import { IUserData } from 'services/users';

export interface IDestinationMap {
  google_analytics: 'google_analytics';
}

export type IDestination = IDestinationMap[keyof IDestinationMap];
export const CATEGORIES = ['analytics', 'advertising', 'functional'] as const;
export type TCategory = typeof CATEGORIES[number];

const destinationConfigs: IDestinationConfig[] = [];

export interface IDestinationConfig {
  key: IDestination;
  category: TCategory;
  feature_flag?: string;
  hasPermission?: (user?: IUserData) => boolean;
}

export const getDestinationConfigs = () => {
  return destinationConfigs;
};

export const allCategories = () => {
  return CATEGORIES;
};

export const registerDestination = (destinationConfig: IDestinationConfig) => {
  destinationConfigs.push(destinationConfig);
};

export const isDestinationActive = (
  config: IDestinationConfig,
  tenant: ITenantData,
  user?: IUserData | null
): boolean => {
  if (config?.feature_flag && !isFeatureActive(config.feature_flag, tenant)) {
    return false;
  }

  if (config?.hasPermission && !config?.hasPermission(user || undefined)) {
    return false;
  }

  return true;
};
