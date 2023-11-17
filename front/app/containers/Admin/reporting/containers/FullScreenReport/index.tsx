import React, { useState, useEffect } from 'react';

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
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import Editor from '../../components/ReportBuilder/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

// utils
import { isNilOrError } from 'utils/helperUtils';

// types
import { SerializedNodes } from '@craftjs/core';
import { LocaleSubject } from 'utils/locale';

export interface Props {
  reportId: string;
}

// TEST
const b = '1px dotted black';
// END TEST

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
      <ReportContext.Provider value="phase">
        <FullScreenWrapper onUpdateDraftData={setDraftData} padding="0">
          {isLoadingLayout && <Spinner />}
          {!isLoadingLayout && (
            <Box w="100%" display="flex" justifyContent="center">
              <Box maxWidth="800px" borderLeft={b} borderRight={b}>
                <Editor isPreview={true}>
                  {editorData && (
                    <ContentBuilderFrame editorData={editorData} />
                  )}
                </Editor>
              </Box>
            </Box>
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
