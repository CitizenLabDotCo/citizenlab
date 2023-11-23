import usePhase from 'api/phases/usePhase';
import useReport from 'api/reports/useReport';
import { useParams } from 'react-router-dom';

const usePhaseFromReportIdParam = () => {
  const { reportId } = useParams() as { reportId: string };
  const report = useReport(reportId);
  const { data: phase } = usePhase(
    report.data?.data?.relationships?.phase?.data?.id
  );
  return phase;
};

export default usePhaseFromReportIdParam;
