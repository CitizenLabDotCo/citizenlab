import { isFeatureActive } from 'components/FeatureFlag';
import { IAppConfigurationData } from 'services/tenant';
import { IUserData } from 'services/users';

export interface IDestinationMap {}

export type IDestination = IDestinationMap[keyof IDestinationMap];
export const CATEGORIES = ['analytics', 'advertising', 'functional'] as const;
export type TCategory = typeof CATEGORIES[number];

const destinationConfigs: IDestinationConfig[] = [];

export interface IDestinationConfig {
  /** A unique key, used to name the destination in the stored cookie */
  key: IDestination;
  /** Destinations are grouped in categories. Under which category should it be listed? */
  category: TCategory;
  /** The name of the feature flag that should be active for the destination to be functional */
  feature_flag?: keyof IAppConfigurationData['attributes']['settings'];
  /** Can the destination be active for the given user? */
  hasPermission?: (user?: IUserData) => boolean;
  /** Name of the destination shown in the UI */
  name?: (tenant: IAppConfigurationData) => JSX.Element | string;
}

export const getDestinationConfigs = () => {
  return destinationConfigs;
};

export const getDestinationConfig = (destination: IDestination) => {
  return destinationConfigs.find((d) => d.key === destination);
};

export const allCategories = () => {
  return CATEGORIES;
};

export const registerDestination = (destinationConfig: IDestinationConfig) => {
  destinationConfigs.push(destinationConfig);
};

export const isDestinationActive = (
  config: IDestinationConfig,
  tenant: IAppConfigurationData,
  user?: IUserData | null
): boolean => {
  if (config?.feature_flag && !isFeatureActive(config.feature_flag, tenant)) {
    return false;
  }

  if (config?.hasPermission && !config.hasPermission(user || undefined)) {
    return false;
  }

  return true;
};
