import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// services
import { LocaleSubject } from 'utils/locale';

// context
import { ReportContext } from '../../context/ReportContext';

// hooks
import useReportLayout from 'api/report_layout/useReportLayout';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';
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
    margin-top: -20px;
    display: block;
    position: absolute;
    @page {
      size: auto;
      margin: 30px 0;
    }
  }
`;

export interface Props {
  reportId: string;
}

export const FullScreenReport = ({ reportId }: Props) => {
  const [draftData, setDraftData] = useState<SerializedNodes | undefined>();
  const { data: reportLayout } = useReportLayout(reportId);
  const reportLocale = useReportLocale(reportLayout?.data);
  const platformLocale = useLocale();

  useEffect(() => {
    if (isNilOrError(reportLocale) || isNilOrError(platformLocale)) return;
    if (reportLocale === platformLocale) return;
    LocaleSubject.next(reportLocale);
  }, [reportLocale, platformLocale]);

  if (isNilOrError(reportLocale)) {
    return null;
  }

  const isLoadingLayout = reportLayout === undefined;

  const savedEditorData = !isNilOrError(reportLayout)
    ? reportLayout.data.attributes.craftjs_jsonmultiloc[reportLocale]
    : undefined;

  const editorData = draftData || savedEditorData;

  return (
    <ReportLanguageProvider
      reportLocale={reportLocale}
      platformLocale={platformLocale}
    >
      <ReportContext.Provider value="pdf">
        <FullScreenWrapper onUpdateDraftData={setDraftData}>
          {isLoadingLayout && <Spinner />}
          {!isLoadingLayout && (
            <Centerer>
              <Content editorData={editorData} />
            </Centerer>
          )}
        </FullScreenWrapper>
      </ReportContext.Provider>
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
