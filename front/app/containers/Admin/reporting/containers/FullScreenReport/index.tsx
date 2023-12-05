import React, { useState } from 'react';

// context
import { ReportContextProvider } from '../../context/ReportContext';

// hooks
import useReportLayout from 'api/report_layout/useReportLayout';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

// components
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import Editor from '../../components/ReportBuilder/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

// utils
import { isNilOrError } from 'utils/helperUtils';

// types
import { SerializedNodes } from '@craftjs/core';

export interface Props {
  reportId: string;
}

export const FullScreenReport = ({ reportId }: Props) => {
  const platformLocale = useLocale();
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();

  const { data: reportLayout } = useReportLayout(reportId);

  const isLoadingLayout = reportLayout === undefined;

  const savedEditorData = !isNilOrError(reportLayout)
    ? reportLayout.data.attributes.craftjs_jsonmultiloc[platformLocale]
    : undefined;

  const editorData = draftData || savedEditorData;

  return (
    <ReportContextProvider width="responsive" reportId={reportId}>
      <FullScreenWrapper onUpdateDraftData={setDraftData} padding="0">
        {isLoadingLayout && <Spinner />}
        {!isLoadingLayout && (
          <Box w="100%" display="flex" justifyContent="center">
            <Box maxWidth="800px" w="100%">
              <Editor isPreview={true}>
                {editorData && <ContentBuilderFrame editorData={editorData} />}
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
