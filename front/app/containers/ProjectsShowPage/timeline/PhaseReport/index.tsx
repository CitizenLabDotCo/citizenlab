import React from 'react';

// hooks
import useReportLayout from 'api/report_layout/useReportLayout';
import useReportLocale from 'containers/Admin/reporting/hooks/useReportLocale';

// components
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import Editor from 'containers/Admin/reporting/components/ReportBuilder/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

// context
import { ReportContextProvider } from 'containers/Admin/reporting/context/ReportContext';

// styling
import { stylingConsts } from 'utils/styleUtils';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

interface Props {
  reportId: string;
}

const PhaseReport = ({ reportId }: Props) => {
  const { data: reportLayout } = useReportLayout(reportId);
  const reportLocale = useReportLocale(reportLayout?.data);
  const smallerThanTablet = useBreakpoint('tablet');
  const smallerThanPhone = useBreakpoint('phone');

  if (!reportLayout || !reportLocale) return null;

  const editorData =
    reportLayout.data.attributes.craftjs_jsonmultiloc[reportLocale];

  return (
    <Box
      w="100%"
      p={smallerThanPhone ? '0px' : '30px'}
      display="flex"
      justifyContent="center"
    >
      <Box
        w="100%"
        maxWidth={`${maxPageWidth}px`}
        display="flex"
        bgColor="white"
        borderRadius={stylingConsts.borderRadius}
        boxShadow="0px 2px 4px -1px rgba(0,0,0,0.06)"
        p={smallerThanTablet ? '0px' : '30px'}
      >
        <ReportContextProvider width="responsive" reportId={reportId}>
          <Box maxWidth="800px" w="100%">
            <Editor isPreview={true}>
              {editorData && <ContentBuilderFrame editorData={editorData} />}
            </Editor>
          </Box>
        </ReportContextProvider>
      </Box>
    </Box>
  );
};

export default PhaseReport;
