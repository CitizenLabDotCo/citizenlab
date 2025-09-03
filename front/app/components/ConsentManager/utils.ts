import { IAppConfigurationData } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';
import { IUserData } from 'api/users/types';

import { isNilOrError, NilOrError } from 'utils/helperUtils';

import { getConsent, IConsentCookie } from './consent';
import {
  allCategories,
  getDestinationConfigs,
  isDestinationActive,
  IDestinationConfig,
} from './destinations';
import { CategorizedDestinations, IPreferences } from './typings';

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
  authUser: IUserData | undefined | null
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
  authUser: IUserData | undefined,
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

function getConsentRequired(
  cookieConsent: IConsentCookie | null,
  activeDestinations: IDestinationConfig[]
): boolean {
  const isConsentRequired =
    !cookieConsent ||
    !!activeDestinations.find(
      (destination) =>
        !Object.keys(cookieConsent.savedChoices).includes(destination.key)
    );

  return isConsentRequired;
}

export function useConsentRequired() {
  const { data: appConfiguration } = useAppConfiguration();
  const { data: authUser } = useAuthUser();

  const activeDestinations = getActiveDestinations(
    appConfiguration?.data,
    authUser?.data
  );
  const cookieConsent = getConsent();

  return getConsentRequired(cookieConsent, activeDestinations);
}
