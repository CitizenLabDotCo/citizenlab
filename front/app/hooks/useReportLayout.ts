import { useEffect, useState } from 'react';

// services
import {
  reportLayoutByIdStream,
  ReportLayoutResponse,
  ReportLayout,
} from 'services/reports';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

export default function useReportLayout(id: string) {
  const [reportLayout, setReportLayout] = useState<ReportLayout | NilOrError>();

  useEffect(() => {
    const { observable } = reportLayoutByIdStream(id);
    const subscription = observable.subscribe(
      (report: ReportLayoutResponse | NilOrError) => {
        setReportLayout(isNilOrError(report) ? report : report.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [id]);

  return reportLayout;
}
