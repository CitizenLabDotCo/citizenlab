import { useEffect, useState } from 'react';

// services
import { reportByIdStream, ReportResponse, Report } from 'services/reports';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

export default function useReport(id: string) {
  const [report, setReport] = useState<Report | NilOrError>();

  useEffect(() => {
    const { observable } = reportByIdStream(id);
    const subscription = observable.subscribe(
      (report: ReportResponse | NilOrError) => {
        setReport(isNilOrError(report) ? report : report.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [id]);

  return report;
}
