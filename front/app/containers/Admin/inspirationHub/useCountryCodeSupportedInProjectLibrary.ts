import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { coreSettings } from 'api/app_configuration/utils';
import useProjectLibraryCountries from 'api/project_library_countries/useProjectLibraryCountries';

const useCountryCodeSupportedInProjectLibrary = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const country_code = appConfiguration
    ? coreSettings(appConfiguration.data).country_code
    : null;

  const { data: projectLibraryCountries, error } = useProjectLibraryCountries();

  if (error) {
    return { status: 'error', countryCode: null } as const;
  }

  if (!projectLibraryCountries || !country_code) {
    return { status: 'loading', countryCode: null } as const;
  }

  const countriesSupportedByLibrary =
    projectLibraryCountries.data.attributes.map((country) => country.code);

  const countryCodeSupported =
    countriesSupportedByLibrary.includes(country_code);

  if (!countryCodeSupported) {
    return { status: 'not-supported', countryCode: null } as const;
  }

  return {
    status: 'supported',
    countryCode: country_code,
  } as const;
};

export default useCountryCodeSupportedInProjectLibrary;
