import { useCallback } from 'react';

import { MessageDescriptor } from 'react-intl';
import { Multiloc } from 'typings';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';

const useLocalizeWithFallback = () => {
  const { formatMessage } = useIntl();
  const locale = useLocale();

  return useCallback(
    (multiloc: Multiloc, fallbackMessage: MessageDescriptor) => {
      const multilocValue = multiloc[locale];
      const fallbackValue = formatMessage(fallbackMessage);

      if (!multilocValue || multilocValue === '') {
        return fallbackValue;
      }

      return multilocValue;
    },
    [formatMessage, locale]
  );
};

export default useLocalizeWithFallback;
