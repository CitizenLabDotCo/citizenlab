import React from 'react';

import {
  Box,
  useBreakpoint,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useReportLayout from 'api/report_layout/useReportLayout';

import Editor from 'containers/Admin/reporting/components/ReportBuilder/Editor';
import { MAX_REPORT_WIDTH } from 'containers/Admin/reporting/constants';
import { ReportContextProvider } from 'containers/Admin/reporting/context/ReportContext';
import { getReportWidth } from 'containers/Admin/reporting/utils/getReportWidth';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

interface Props {
  reportId: string;
  phaseId: string;
}

const PhaseReport = ({ reportId, phaseId }: Props) => {
  const { data: reportLayout } = useReportLayout(reportId);
  const smallerThanPhone = useBreakpoint('phone');
  const smallerThanTablet = useBreakpoint('tablet');

  if (!reportLayout) return null;

  const editorData = reportLayout.data.attributes.craftjs_json;

  return (
    <Box
      w="100%"
      p={smallerThanPhone ? '0px' : '30px'}
      pt={smallerThanPhone ? '20px' : '0px'}
      display="flex"
      justifyContent="center"
      id="e2e-phase-report"
    >
      <Box
        w="100%"
        maxWidth={`${maxPageWidth}px`}
        display="flex"
        bgColor="white"
        borderRadius={stylingConsts.borderRadius}
        boxShadow="0px 2px 4px -1px rgba(0,0,0,0.06)"
        px={smallerThanPhone ? '20px' : '30px'}
        py={smallerThanPhone ? '20px' : '30px'}
      >
        <ReportContextProvider
          width={getReportWidth({ smallerThanPhone, smallerThanTablet })}
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
                {/* TODO: Fix this the next time the file is edited. */}
                {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
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
