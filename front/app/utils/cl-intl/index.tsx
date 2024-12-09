import { Locale } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';

import FormattedMessage from './FormattedMessage';
import injectIntl from './injectIntl';
import useFormatMessageWithLocale from './useFormatMessageWithLocale';
import useIntl from './useIntl';

export { FormattedMessage, injectIntl, useIntl, useFormatMessageWithLocale };
export type { MessageDescriptor };

export const shouldCapitilize = (locale: Locale) => {
  const localesNotCapitlized = ['de-DE'];
  return !localesNotCapitlized.includes(locale);
};
