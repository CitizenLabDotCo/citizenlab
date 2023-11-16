import React from 'react';
import useReportLayout from 'api/report_layout/useReportLayout';
import useReportLocale from 'containers/Admin/reporting/hooks/useReportLocale';
import Content from 'containers/Admin/reporting/containers/FullScreenReport/Content';
import { Box } from '@citizenlab/cl2-component-library';

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
      <Content editorData={editorData} />
    </Box>
  );
};

export default PhaseReport;
