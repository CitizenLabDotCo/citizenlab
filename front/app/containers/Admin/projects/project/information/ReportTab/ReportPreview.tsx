import React from 'react';

// context

import { Box } from '@citizenlab/cl2-component-library';
import Editor from 'containers/Admin/reporting/components/ReportBuilder/Editor';
import { MAX_REPORT_WIDTH } from 'containers/Admin/reporting/constants';
import { ReportContextProvider } from 'containers/Admin/reporting/context/ReportContext';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

import useReportLayout from 'api/report_layout/useReportLayout';

interface Props {
  reportId: string;
  phaseId: string;
}

const ReportPreview = ({ reportId, phaseId }: Props) => {
  const { data: reportLayout } = useReportLayout(reportId);
  if (!reportLayout) return null;

  const editorData = reportLayout.data.attributes.craftjs_json;

  return (
    <ReportContextProvider
      width="desktop"
      reportId={reportId}
      phaseId={phaseId}
    >
      <Box
        w="100%"
        display="flex"
        alignItems="flex-start"
        flexDirection="column"
      >
        <Box maxWidth={MAX_REPORT_WIDTH} w="100%">
          <Editor isPreview={true}>
            {editorData && <ContentBuilderFrame editorData={editorData} />}
          </Editor>
        </Box>
      </Box>
    </ReportContextProvider>
  );
};

export default ReportPreview;
