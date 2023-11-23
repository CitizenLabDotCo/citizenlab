import React from 'react';
import useReportLayout from 'api/report_layout/useReportLayout';
import useReportLocale from 'containers/Admin/reporting/hooks/useReportLocale';
import { Box } from '@citizenlab/cl2-component-library';
import Editor from 'containers/Admin/reporting/components/ReportBuilder/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

interface Props {
  reportId: string;
}

const PhaseReport = ({ reportId }: Props) => {
  const { data: reportLayout } = useReportLayout(reportId);
  const reportLocale = useReportLocale(reportLayout?.data);
  if (!reportLayout || !reportLocale) return null;

  const editorData =
    reportLayout.data.attributes.craftjs_jsonmultiloc[reportLocale];

  return (
    <Box w="100%" display="flex" justifyContent="center">
      <Box maxWidth="800px">
        <Editor isPreview={true}>
          {editorData && <ContentBuilderFrame editorData={editorData} />}
        </Editor>
      </Box>
    </Box>
  );
};

export default PhaseReport;
