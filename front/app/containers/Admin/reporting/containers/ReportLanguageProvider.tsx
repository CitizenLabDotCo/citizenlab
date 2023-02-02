import React, { useEffect, useState } from 'react';

// Utils
import { IntlProvider } from 'react-intl';
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import moment from 'moment';

// Typings
import { Locale } from 'typings';

type Props = {
  reportLocale: Locale | NilOrError;
  platformLocale: Locale | NilOrError;
  children: React.ReactNode;
};

// Loads correct messages for the report locale & change moment locale
const ReportLanguageProvider = ({
  reportLocale,
  platformLocale,
  children,
}: Props) => {
  const [messages, setMessages] = useState();

  useEffect(() => {
    if (!isNilOrError(reportLocale)) {
      import(`i18n/${reportLocale}`).then((translationMessages) => {
        setMessages(translationMessages.default);
      });
      moment.locale(reportLocale);
    }

    return () => {
      // Set the moment locale back to the platform locale on cleanup
      if (!isNilOrError(platformLocale)) {
        moment.locale(platformLocale);
      }
    };
  }, [reportLocale, platformLocale]);

  if (isNilOrError(reportLocale)) {
    return null;
  }

  return (
    <IntlProvider locale={reportLocale} key={reportLocale} messages={messages}>
      {children}
    </IntlProvider>
  );
};

export default ReportLanguageProvider;
