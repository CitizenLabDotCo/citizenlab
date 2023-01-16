import { useEffect, useState } from 'react';

// services
import { reportsStream, ReportsResponse, Report } from 'services/reports';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

export default function useReports() {
  const [reports, setReports] = useState<Report[] | NilOrError>();

  useEffect(() => {
    const { observable } = reportsStream();
    const subscription = observable.subscribe(
      (reports: ReportsResponse | NilOrError) => {
        setReports(isNilOrError(reports) ? reports : reports.data);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return reports;
}
