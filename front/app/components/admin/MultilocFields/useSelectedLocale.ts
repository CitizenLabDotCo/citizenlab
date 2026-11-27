import { useState } from 'react';

import { SupportedLocale } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

// The platform locale a multilingual field is showing. It starts on the
// user's locale when the platform has it, else on the first platform locale.
const useSelectedLocale = () => {
  const locales = useAppConfigurationLocales();
  const userLocale = useLocale();
  const [picked, setPicked] = useState<SupportedLocale>();

  const initialLocale = locales?.includes(userLocale)
    ? userLocale
    : locales?.[0];

  return {
    locales: locales ?? [],
    selectedLocale:
      picked && locales?.includes(picked) ? picked : initialLocale,
    setSelectedLocale: setPicked,
  };
};

export default useSelectedLocale;
