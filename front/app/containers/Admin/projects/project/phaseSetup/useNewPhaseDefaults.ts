import { ParticipationMethod } from 'api/phases/types';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import { useFormatMessageWithLocale } from 'utils/cl-intl';

import { getNewPhaseDefaults } from './newPhaseDefaults';

/** Undefined until the tenant's locales are known. */
const useNewPhaseDefaults = () => {
  const tenantLocales = useAppConfigurationLocales();
  const formatMessageWithLocale = useFormatMessageWithLocale();

  if (!tenantLocales || !formatMessageWithLocale) return undefined;

  return (participationMethod: ParticipationMethod, standalone = false) =>
    getNewPhaseDefaults({
      participationMethod,
      standalone,
      tenantLocales,
      formatMessageWithLocale,
    });
};

export default useNewPhaseDefaults;
