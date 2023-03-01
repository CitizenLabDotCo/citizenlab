// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// cookies
import {
  allCategories,
  getDestinationConfigs,
  isDestinationActive,
  IDestinationConfig,
} from './destinations';
import { IConsentCookie } from './consent';

// typings
import { IAppConfigurationData } from 'services/appConfiguration';
import { CategorizedDestinations, IPreferences } from './typings';
import { TAuthUser } from 'hooks/useAuthUser';

export const getCategory = (
  tenant: IAppConfigurationData,
  destinationConfig: IDestinationConfig
) => {
  return typeof destinationConfig.category === 'function'
    ? destinationConfig.category(tenant)
    : destinationConfig.category;
};

export const categorizeDestinations = (
  appConfiguration: IAppConfigurationData | NilOrError,
  destinations: IDestinationConfig[]
): CategorizedDestinations => {
  const output: CategorizedDestinations = {
    analytics: [],
    advertising: [],
    functional: [],
  };

  if (isNilOrError(appConfiguration)) {
    return output;
  }

  destinations.forEach((destinationConfig) => {
    const category = getCategory(appConfiguration, destinationConfig);
    output[category].push(destinationConfig.key);
  });

  return output;
};

export const getActiveDestinations = (
  appConfiguration: IAppConfigurationData | NilOrError,
  authUser: TAuthUser
): IDestinationConfig[] => {
  if (isNilOrError(appConfiguration)) return [];

  return getDestinationConfigs().filter((config) =>
    isDestinationActive(
      config,
      appConfiguration,
      isNilOrError(authUser) ? undefined : authUser
    )
  );
};

export const getCurrentPreferences = (
  appConfiguration: IAppConfigurationData | NilOrError,
  authUser: TAuthUser,
  cookieConsent: IConsentCookie | null
) => {
  const newDestinations = getActiveDestinations(
    appConfiguration,
    authUser
  ).filter((config) => cookieConsent?.savedChoices[config.key] === undefined);

  const output: IPreferences = {};
  allCategories().forEach((category) => {
    // if it was enabled and there's a new destination
    if (
      !cookieConsent ||
      (cookieConsent[category] &&
        newDestinations.find((config) => config.category === category))
    ) {
      // reset the category
      output[category] = undefined;
    } else {
      // keep the previous value
      output[category] = cookieConsent[category];
    }
  });

  return output;
};

export const getConsentRequired = (
  cookieConsent: IConsentCookie | null,
  activeDestinations: IDestinationConfig[]
) => {
  const isConsentRequired =
    !cookieConsent ||
    !!activeDestinations.find(
      (destination) =>
        !Object.keys(cookieConsent?.savedChoices).includes(destination.key)
    );

  return isConsentRequired;
};
