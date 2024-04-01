import { SupportedLocale } from 'typings';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import { isNilOrError } from 'utils/helperUtils';

export default function useAppConfigurationLocales() {
  const { data: appConfiguration } = useAppConfiguration();

  const appConfigurationLocales: SupportedLocale[] | undefined = !isNilOrError(
    appConfiguration
  )
    ? appConfiguration.data.attributes.settings.core.locales
    : appConfiguration;

  return appConfigurationLocales;
}
