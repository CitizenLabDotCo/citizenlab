import React, { useEffect, useState } from 'react';

import moment from 'moment';
import { IntlProvider } from 'react-intl';
import { Locale } from 'typings';

import { isNilOrError, NilOrError } from 'utils/helperUtils';

type Props = {
  contentBuilderLocale: Locale | NilOrError;
  platformLocale: Locale | NilOrError;
  children: React.ReactNode;
};

// Loads correct messages for the contentBuilder locale & change moment locale
const ContentBuilderLanguageProvider = ({
  contentBuilderLocale,
  platformLocale,
  children,
}: Props) => {
  const [messages, setMessages] = useState();

  useEffect(() => {
    if (!isNilOrError(contentBuilderLocale)) {
      import(`i18n/${contentBuilderLocale}`).then((translationMessages) => {
        setMessages(translationMessages.default);
      });
      moment.locale(contentBuilderLocale);
    }

    return () => {
      // Set the moment locale back to the platform locale on cleanup
      if (!isNilOrError(platformLocale)) {
        moment.locale(platformLocale);
      }
    };
  }, [contentBuilderLocale, platformLocale]);

  if (isNilOrError(contentBuilderLocale) || !messages) {
    return null;
  }

  return (
    <IntlProvider locale={contentBuilderLocale} messages={messages}>
      {children}
    </IntlProvider>
  );
};

export default ContentBuilderLanguageProvider;
