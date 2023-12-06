import React from 'react';

// context
import { ReportContextProvider } from '../../context/ReportContext';

// hooks
import useReportLayout from 'api/report_layout/useReportLayout';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import Editor from '../../components/ReportBuilder/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

export interface Props {
  reportId: string;
}

export const FullScreenReport = ({ reportId }: Props) => {
  const { data: reportLayout } = useReportLayout(reportId);
  const isLoadingLayout = reportLayout === undefined;

  return (
    <ReportContextProvider width="responsive" reportId={reportId}>
      <FullScreenWrapper padding="0">
        {isLoadingLayout && <Spinner />}
        {!isLoadingLayout && (
          <Box w="100%" display="flex" justifyContent="center">
            <Box maxWidth="800px" w="100%">
              <Editor isPreview={true}>
                <ContentBuilderFrame
                  editorData={reportLayout.data.attributes.craftjs_json}
                />
              </Editor>
            </Box>
          </Box>
        )}
      </FullScreenWrapper>
    </ReportContextProvider>
  );
};

const FullScreenReportWrapper = () => {
  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  const { reportId } = useParams();

  if (!reportBuilderEnabled || reportId === undefined) {
    return null;
  }

  return <FullScreenReport reportId={reportId} />;
};

export default FullScreenReportWrapper;
