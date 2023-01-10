import React, { useState } from 'react';
import styled from 'styled-components';

// hooks
import useReportLayout from 'hooks/useReportLayout';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from '../../../../../hooks/useLocale';
import useReportLocale from '../../hooks/useReportLocale';
import ReportLanguageProvider from '../ReportLanguageProvider';

// components
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import { Spinner } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';
import Content from './Content';

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
  const reportLayout = useReportLayout(reportId);
  const reportLocale = useReportLocale(reportLayout);
  const platformLocale = useLocale();

  if (isNilOrError(reportLocale)) {
    return null;
  }

  const isLoadingLayout = reportLayout === undefined;

  const savedEditorData = !isNilOrError(reportLayout)
    ? reportLayout.attributes.craftjs_jsonmultiloc[reportLocale]
    : undefined;

  const editorData = draftData || savedEditorData;

  return (
    <ReportLanguageProvider
      reportLocale={reportLocale}
      platformLocale={platformLocale}
    >
      <FullScreenWrapper
        onUpdateDraftData={setDraftData}
        onUpdateLocale={() => {}}
      >
        {isLoadingLayout && <Spinner />}
        {!isLoadingLayout && (
          <Centerer>
            <Content editorData={editorData} />
          </Centerer>
        )}
      </FullScreenWrapper>
    </ReportLanguageProvider>
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
