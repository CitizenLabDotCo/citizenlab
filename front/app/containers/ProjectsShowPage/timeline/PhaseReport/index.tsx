import React from 'react';

// hooks
import useReportLayout from 'api/report_layout/useReportLayout';

// components
import {
  Box,
  useBreakpoint,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import Editor from 'containers/Admin/reporting/components/ReportBuilder/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

// context
import { ReportContextProvider } from 'containers/Admin/reporting/context/ReportContext';

// constants
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import { MAX_REPORT_WIDTH } from 'containers/Admin/reporting/constants';

// utils
import { getReportWidth } from 'containers/Admin/reporting/utils/getReportWidth';

interface Props {
  reportId: string;
}

const PhaseReport = ({ reportId }: Props) => {
  const { data: reportLayout } = useReportLayout(reportId);
  const smallerThanPhone = useBreakpoint('phone');
  const smallerThanTablet = useBreakpoint('tablet');

  if (!reportLayout) return null;

  const editorData = reportLayout.data.attributes.craftjs_json;

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
        <ReportContextProvider
          width={getReportWidth({ smallerThanPhone, smallerThanTablet })}
          reportId={reportId}
        >
          <Box
            w="100%"
            display="flex"
            alignItems="center"
            flexDirection="column"
          >
            <Box maxWidth={MAX_REPORT_WIDTH} w="100%">
              <Editor isPreview={true}>
                {editorData && <ContentBuilderFrame editorData={editorData} />}
              </Editor>
            </Box>
          </Box>
        </ReportContextProvider>
      </Box>
    </Box>
  );
};

export default PhaseReport;
