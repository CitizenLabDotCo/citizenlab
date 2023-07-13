// import { useEffect, useState } from 'react';

// services
// import { reportsStream, ReportsResponse, Report } from 'services/reports';

// utils
// import { isNilOrError, NilOrError } from 'utils/helperUtils';
import useProjectById from '../api/projects/useProjectById';
import usePhases from '../api/phases/usePhase';

export default function usePostManagerColumns(
  projectId: string | null,
  phaseId: string | null
) {
  const project = useProjectById(projectId);
  const phase = usePhases(phaseId);
  console.log(phase, project);

  // TODO: Define the correct columns based on voting method etc
  //
  // const [reports, setReports] = useState<Report[] | NilOrError>();
  //
  // useEffect(() => {
  //   const { observable } = reportsStream();
  //   const subscription = observable.subscribe(
  //     (reports: ReportsResponse | NilOrError) => {
  //       setReports(isNilOrError(reports) ? reports : reports.data);
  //     }
  //   );
  //
  //   return () => subscription.unsubscribe();
  // }, []);

  return [
    'selection',
    'assignee',
    'title',
    'published_on',
    'up',
    'down',
    'picks',
  ];
}
