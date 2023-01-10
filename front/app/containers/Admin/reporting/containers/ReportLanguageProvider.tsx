import React, { useEffect, useState } from 'react';
import { IntlProvider } from 'react-intl';
import { isNilOrError, NilOrError } from '../../../../utils/helperUtils';
import { Locale } from '../../../../typings';

type props = {
  locale: Locale | NilOrError;
  children: React.ReactNode;
};

// Loads correct messages for the report locale
const ReportLanguageProvider = ({ locale, children }: props) => {
  const [messages, setMessages] = useState(undefined);

  useEffect(() => {
    // Note: seems inefficient when we have already loaded all these in the main LanguageProvider
    import(`i18n/${locale}`).then((translationMessages) => {
      setMessages(translationMessages.default);
    });
  }, [locale]);

  if (isNilOrError(locale)) {
    return null;
  }

  return (
    <IntlProvider locale={locale} key={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
};

export default ReportLanguageProvider;
