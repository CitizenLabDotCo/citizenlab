import { useEffect } from 'react';

// services
import { updateLocale } from '../../../../services/locale';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import useLocale from '../../../../hooks/useLocale';
import { ReportLayout } from '../../../../services/reports';

export default function useReportLocale(
  reportLayout: ReportLayout | NilOrError
) {
  const locale = useLocale();

  useEffect(() => {
    // Switch platform to match language of the report
    if (!isNilOrError(reportLayout)) {
      const reportLocales = Object.keys(
        reportLayout.attributes.craftjs_jsonmultiloc
      );
      if (reportLocales.length > 0) {
        console.log('GOT REPORT LOCALE OF: ', reportLocales[0]);
        updateLocale(reportLocales[0]); // Update the locale of the site to match the report
      }
    }
  }, [locale, reportLayout]);
}
