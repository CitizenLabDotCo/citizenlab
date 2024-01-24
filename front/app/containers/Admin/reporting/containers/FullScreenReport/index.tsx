import React, { useState } from 'react';

// context
import { ReportContextProvider } from '../../context/ReportContext';

// hooks
import useReportLayout from 'api/report_layout/useReportLayout';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import Editor from '../../components/ReportBuilder/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

// utils
import { getReportWidth } from '../../utils/getReportWidth';
import { ReportLayoutResponse } from 'api/report_layout/types';

export interface Props {
  reportId: string;
  reportLayout: ReportLayoutResponse;
}

export const FullScreenReport = ({ reportId, reportLayout }: Props) => {
  const [initialData] = useState(reportLayout.data.attributes.craftjs_json);
  const smallerThanPhone = useBreakpoint('phone');
  const smallerThanTablet = useBreakpoint('tablet');

  return (
    <ReportContextProvider
      width={getReportWidth({ smallerThanPhone, smallerThanTablet })}
      reportId={reportId}
    >
      <FullScreenWrapper padding="0">
        <Box w="100%" display="flex" justifyContent="center">
          <Box maxWidth="800px" w="100%" pt="20px">
            <Editor isPreview={true}>
              <ContentBuilderFrame editorData={initialData} />
            </Editor>
          </Box>
        </Box>
      </FullScreenWrapper>
    </ReportContextProvider>
  );
};

const FullScreenReportWrapper = () => {
  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  const { reportId } = useParams();
  const { data: reportLayout } = useReportLayout(reportId);

  if (!reportBuilderEnabled || !reportId || !reportLayout) {
    return null;
  }

  return <FullScreenReport reportId={reportId} reportLayout={reportLayout} />;
};

export default FullScreenReportWrapper;
