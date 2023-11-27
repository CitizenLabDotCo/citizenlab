import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// services
import { LocaleSubject } from 'utils/locale';

// context
import { ReportContextProvider } from '../../context/ReportContext';

// hooks
import useReportLayout from 'api/report_layout/useReportLayout';
import useLocale from 'hooks/useLocale';
import useReportLocale from '../../hooks/useReportLocale';
import ReportLanguageProvider from '../ReportLanguageProvider';

// components
import FullScreenWrapper from 'components/admin/ContentBuilder/FullscreenPreview/Wrapper';
import { Spinner, Box } from '@citizenlab/cl2-component-library';
import Editor from '../../components/ReportBuilder/Editor';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

// utils
import { isNilOrError } from 'utils/helperUtils';

// constants
import { A4_WIDTH } from '../../constants';

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

export const Report = ({ reportId }: Props) => {
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
      <ReportContextProvider width="pdf" reportId={reportId}>
        <FullScreenWrapper onUpdateDraftData={setDraftData}>
          {isLoadingLayout && <Spinner />}
          {!isLoadingLayout && (
            <Centerer>
              <Box
                width={A4_WIDTH}
                pl="5mm"
                pr="10mm"
                position="absolute"
                background="white"
              >
                <Box>
                  <Editor isPreview={true}>
                    {editorData && (
                      <ContentBuilderFrame editorData={editorData} />
                    )}
                  </Editor>
                </Box>
              </Box>
            </Centerer>
          )}
        </FullScreenWrapper>
      </ReportContextProvider>
    </ReportLanguageProvider>
  );
};

export default Report;
