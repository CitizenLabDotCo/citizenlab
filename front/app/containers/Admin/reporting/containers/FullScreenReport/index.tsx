import React, { useState } from 'react';
import styled from 'styled-components';

// hooks
import useReportLayout from 'hooks/useReportLayout';
import useLocale from 'hooks/useLocale';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import { Spinner } from '@citizenlab/cl2-component-library';
import { isNilOrError } from 'utils/helperUtils';
import Content from './Content';

// types
import { SerializedNodes } from '@craftjs/core';
import { Locale } from 'typings';

const Centerer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media print {
    display: block;
    position: absolute;
    @page {
      size: auto;
      margin-top: 0;
      margin-bottom: 0;
    }
  }
`;

interface Props {
  reportId: string;
}

const FullScreenReport = ({ reportId }: Props) => {
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const [selectedLocale, setSelectedLocale] = useState<Locale | undefined>();
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
      {!isLoadingLayout && (
        <Centerer>
          <Content editorData={editorData} />
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
