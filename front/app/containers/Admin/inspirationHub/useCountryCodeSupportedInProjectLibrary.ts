import { useEffect, useState } from 'react';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { coreSettings } from 'api/app_configuration/utils';
import useProjectLibraryCountries from 'api/project_library_countries/useProjectLibraryCountries';

const useCountryCodeSupportedInProjectLibrary = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const country_code = appConfiguration
    ? coreSettings(appConfiguration.data).country_code
    : null;

  // If the project library countries fetch fails,
  // react-query will retry the request indefinitely for some reason.
  // This piece of state is used to prevent that.
  // I tried using the `retry` option that react-query provides,
  // but it didn't work for some reason.
  const [fetchedWithError, setFetchedWithError] = useState(false);
  const { data: projectLibraryCountries, error } = useProjectLibraryCountries({
    enabled: !fetchedWithError,
  });

  useEffect(() => {
    if (fetchedWithError) return;
    if (error) {
      setFetchedWithError(true);
    }
  }, [error, fetchedWithError]);

  if (fetchedWithError) {
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
