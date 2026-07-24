import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// Derives the phone input's country configuration from the platform's SMS settings:
// the allow-list that restricts the country dropdown, and the country to pre-select
// (which also determines the pre-filled "+…" calling code).
const usePhoneInputCountries = () => {
  const { data: appConfig } = useAppConfiguration();
  const settings = appConfig?.data.attributes.settings;

  const allowedCountryCodes = settings?.sms?.allowed_country_codes;
  // Restrict the dropdown only when an allow-list is configured; otherwise show all.
  const allowedCountries =
    allowedCountryCodes && allowedCountryCodes.length > 0
      ? allowedCountryCodes
      : undefined;

  const platformCountryCode = settings?.core.country_code ?? undefined;
  // Prefer the platform's own country as the default so the pre-filled "+…" calling
  // code is relevant. When the dropdown is restricted to an allow-list, use the
  // platform's country only if it's included, otherwise the first allowed country.
  const defaultCountry = allowedCountries
    ? allowedCountries.find((country) => country === platformCountryCode) ??
      allowedCountries[0]
    : platformCountryCode;

  return { allowedCountries, defaultCountry };
};

export default usePhoneInputCountries;
