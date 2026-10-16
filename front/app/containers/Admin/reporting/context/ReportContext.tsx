import React, { createContext, useContext } from 'react';

import { SupportedLocale } from 'typings';

import usePhase from 'api/phases/usePhase';

type ReportWidth = 'phone' | 'tablet' | 'desktop' | 'pdf';

interface ReportContextBase {
  width: ReportWidth;
  reportId?: string;
  phaseId?: string;
  contentBuilderLocale?: SupportedLocale;
  // Set once the PDF path has screenshotted every live map, after which a map is
  // rendered as that screenshot. See MapQuestions.
  mapsCaptured?: boolean;
}

export interface ReportContextProps extends ReportContextBase {
  children: React.ReactNode;
}

interface ReportContextData extends ReportContextBase {
  projectId?: string;
}

// In practice, the context will never have these default values- just put them here to please TS
const Context = createContext<ReportContextData>({
  width: 'pdf',
  reportId: '',
});

export const ReportContextProvider = ({
  width,
  reportId,
  phaseId,
  contentBuilderLocale,
  mapsCaptured,
  children,
}: ReportContextProps) => {
  const { data: phase } = usePhase(phaseId);
  const projectId = phase?.data.relationships.project.data.id;

  // If report has phase relation: also wait for project id to be available
  if (phaseId && !projectId) return null;

  return (
    <Context.Provider
      value={{
        width,
        reportId,
        projectId,
        phaseId,
        contentBuilderLocale,
        mapsCaptured,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useReportContext = () => {
  return useContext(Context);
};
