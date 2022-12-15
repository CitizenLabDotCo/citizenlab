import React, { useState } from 'react';
import styled from 'styled-components';

// hooks
import useReportLayout from 'hooks/useReportLayout';
import useLocale from 'hooks/useLocale';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import Editor from '../../components/ReportBuilder/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';

// constants
import { A4_WIDTH, A4_MARGIN_Y } from '../../constants';

// types
import { SerializedNodes } from '@craftjs/core';

const Centerer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media print {
    display: block;
  }

  @page {
    size: auto;
    margin: 0mm;
  }
`;

interface Props {
  reportId: string;
}

const FullScreenReport = ({ reportId }: Props) => {
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const [selectedLocale, setSelectedLocale] = useState<string | undefined>();
  const platformLocale = useLocale();
  const reportLayout = useReportLayout(reportId);

  if (isNilOrError(platformLocale)) {
    return null;
  }

  const locale = selectedLocale || platformLocale;
  const isLoadingLayout = reportLayout === undefined;

  const savedEditorData = !isNilOrError(reportLayout)
    ? reportLayout.attributes.craftjs_jsonmultiloc[locale]
    : undefined;

  const editorData = draftData || savedEditorData;

  return (
    <FullScreenWrapper
      onUpdateDraftData={setDraftData}
      onUpdateLocale={setSelectedLocale}
    >
      {isLoadingLayout && <Spinner />}
      {!isLoadingLayout && editorData && (
        <Centerer>
          {/* Printing adds some arbitrary left margin- picked
          these padding values through trial and error to make it
          look nice and centered */}
          <Box width={A4_WIDTH} pl="5mm" pr="15mm" py={A4_MARGIN_Y}>
            <Box>
              <Editor isPreview={true}>
                <ContentBuilderFrame editorData={editorData} />
              </Editor>
            </Box>
          </Box>
        </Centerer>
      )}
    </FullScreenWrapper>
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
