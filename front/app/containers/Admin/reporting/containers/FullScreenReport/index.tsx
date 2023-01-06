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
import useReportLocale from '../../hooks/useReportLocale';

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

export const LocaleContext = React.createContext('en');

const FullScreenReport = ({ reportId }: Props) => {
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const [selectedLocale, setSelectedLocale] = useState<Locale | undefined>();
  const platformLocale = useLocale();
  const reportLayout = useReportLayout(reportId);
  useReportLocale(reportLayout);

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
    <LocaleContext.Provider value="en">
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
    </LocaleContext.Provider>
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
