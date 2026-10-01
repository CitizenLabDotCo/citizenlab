import React, { createContext, useContext } from 'react';

import { SupportedLocale } from 'typings';

import usePhase from 'api/phases/usePhase';
import useReportLayout from 'api/report_layout/useReportLayout';

import BlockDataProvider from 'components/admin/ContentBuilder/CustomBlocks/runtime/BlockDataContext';

type ReportWidth = 'phone' | 'tablet' | 'desktop' | 'pdf';

interface ReportContextBase {
  width: ReportWidth;
  reportId?: string;
  phaseId?: string;
  contentBuilderLocale?: SupportedLocale;
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
  children,
}: ReportContextProps) => {
  const { data: phase } = usePhase(phaseId);
  const projectId = phase?.data.relationships.project.data.id;
  // The blocks on this report answer their queries against its layout, so that a
  // reader sees the stored answer rather than running SQL of their own.
  const { data: layout } = useReportLayout(reportId);

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
      }}
    >
      <BlockDataProvider layoutId={layout?.data.id}>
        {children}
      </BlockDataProvider>
    </Context.Provider>
  );
};

export const useReportContext = () => {
  return useContext(Context);
};
