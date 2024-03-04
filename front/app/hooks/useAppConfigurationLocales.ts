import { Locale } from 'typings';

import { isNilOrError } from 'utils/helperUtils';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

export default function useAppConfigurationLocales() {
  const { data: appConfiguration } = useAppConfiguration();

  const appConfigurationLocales: Locale[] | undefined = !isNilOrError(
    appConfiguration
  )
    ? appConfiguration.data.attributes.settings.core.locales
    : appConfiguration;

  return appConfigurationLocales;
}
