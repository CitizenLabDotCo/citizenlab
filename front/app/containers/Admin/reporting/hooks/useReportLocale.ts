import { useEffect, useState } from 'react';

// utils
import { isNilOrError, NilOrError, keys } from 'utils/helperUtils';
import useLocale from 'hooks/useLocale';
import { ReportLayout } from 'services/reports';
import { Locale } from 'typings';

// Extracts the locale of the report from the multiloc
// Note: Returns a string not a Locale as that's what IntlProvider requires
export default function useReportLocale(
  reportLayout: ReportLayout | NilOrError
) {
  const platformLocale = useLocale();
  const [locale, setLocale] = useState<Locale | NilOrError>(undefined);

  useEffect(() => {
    // Switch platform to match language of the report
    if (!isNilOrError(reportLayout)) {
      const reportLocales = keys(reportLayout.attributes.craftjs_jsonmultiloc);
      if (reportLocales.length > 0 && platformLocale !== reportLocales[0]) {
        setLocale(reportLocales[0]);
      } else {
        setLocale(platformLocale ? platformLocale : undefined);
      }
    }
  }, [reportLayout, platformLocale]);
  return locale;
}
