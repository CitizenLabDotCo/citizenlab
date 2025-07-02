import { useEffect, useState } from 'react';

import useAppConfiguration from 'api/app_configuration/__mocks__/useAppConfiguration';
import { coreSettings } from 'api/app_configuration/utils';
import useProjectLibraryCountries from 'api/project_library_countries/useProjectLibraryCountries';

const useCountryCodeSupportedInProjectLibrary = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const { country_code } = coreSettings(appConfiguration.data);

  // If the project library countries fetch fails,
  // react-query will retry the request indefinitely for some reason.
  // This piece of state is used to prevent that.
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
    return null;
  }

  if (!projectLibraryCountries || !country_code) {
    return null;
  }

  const countryCodeSupported = (() => {
    const countriesSupportedByLibrary =
      projectLibraryCountries.data.attributes.map((country) => country.code);

    return countriesSupportedByLibrary.includes(country_code);
  })();

  if (!countryCodeSupported) {
    return null;
  }

  return country_code;
};

export default useCountryCodeSupportedInProjectLibrary;
