import { useEffect, useState } from 'react';

// utils
import { keys, isNilOrError } from 'utils/helperUtils';
import useLocale from 'hooks/useLocale';
import { ReportLayout } from 'api/report_layout/types';
import { Locale } from 'typings';

// Extracts the locale of the report from the multiloc
// Note: Returns a string not a Locale as that's what IntlProvider requires
export default function useReportLocale(reportLayout?: ReportLayout) {
  const platformLocale = useLocale();
  const [locale, setLocale] = useState<Locale | undefined>(undefined);

  useEffect(() => {
    if (!reportLayout) return;
    // Switch platform to match language of the report
    const reportLocales = keys(reportLayout.attributes.craftjs_jsonmultiloc);
    if (reportLocales.length > 0 && platformLocale !== reportLocales[0]) {
      // System should never allow more than one locale to be saved, but only return the first just in case
      setLocale(reportLocales[0]);
    } else {
      setLocale(!isNilOrError(platformLocale) ? platformLocale : undefined);
    }
  }, [reportLayout, platformLocale]);
  return locale;
}
