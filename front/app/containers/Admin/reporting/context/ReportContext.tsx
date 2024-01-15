import React, { createContext, useContext } from 'react';
import useReport from 'api/reports/useReport';
import usePhase from 'api/phases/usePhase';

type ReportWidth = 'phone' | 'tablet' | 'desktop' | 'pdf';

interface ReportContextBase {
  width: ReportWidth;
  reportId: string;
}

export interface ReportContextProps extends ReportContextBase {
  children: React.ReactNode;
}

interface ReportContextData extends ReportContextBase {
  projectId?: string;
  phaseId?: string;
}

// In practice, the context will never have these default values- just put them here to please TS
const Context = createContext<ReportContextData>({
  width: 'pdf',
  reportId: '',
});

export const ReportContextProvider = ({
  width,
  reportId,
  children,
}: ReportContextProps) => {
  const { data: report } = useReport(reportId);
  const phaseId = report?.data.relationships.phase?.data?.id;

  const { data: phase } = usePhase(phaseId);
  const projectId = phase?.data.relationships.project.data.id;

  // Wait for report to be available
  if (report === undefined) return null;

  // If report has phase relation: also wait for project id to be available
  if (phaseId && !projectId) return null;

  return (
    <Context.Provider
      value={{
        width,
        reportId,
        projectId,
        phaseId,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useReportContext = () => {
  return useContext(Context);
};
