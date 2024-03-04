import React, { useState } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import {
  A4_WIDTH,
  MAX_REPORT_WIDTH,
} from 'containers/Admin/reporting/constants';
import {
  ReportContextProvider,
  useReportContext,
} from 'containers/Admin/reporting/context/ReportContext';
import { Locale } from 'typings';

import DesktopButton from 'components/admin/ContentBuilder/EditModePreview/ViewButtons/DesktopButton';
import MobileButton from 'components/admin/ContentBuilder/EditModePreview/ViewButtons/MobileButton';
import Frame from 'components/admin/ContentBuilder/Frame';

// context

import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import { CraftJson } from 'components/admin/ContentBuilder/typings';

import useLocale from 'hooks/useLocale';

import PDFButton from './PDFButton';
import PDFWrapper from './PDFWrapper';

interface Props {
  previewData?: CraftJson;
  selectedLocale: Locale;
}

type View = 'phone' | 'pdf' | 'desktop';

const EditModePreview = ({ previewData, selectedLocale }: Props) => {
  const { phaseId, reportId } = useReportContext();
  const isPhaseContext = !!phaseId;

  const [view, setView] = useState<View>(isPhaseContext ? 'phone' : 'pdf');
  const platformLocale = useLocale();

  return (
    <Box
      mt={`${stylingConsts.menuHeight + 20}px`}
      minHeight={`calc(100vh - ${2 * stylingConsts.menuHeight + 20}px)`}
      justifyContent="center"
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        {isPhaseContext && (
          <Box display="flex" mb="16px">
            <MobileButton
              active={view === 'phone'}
              onClick={() => {
                setView('phone');
              }}
            />
            <PDFButton
              active={view === 'pdf'}
              onClick={() => {
                setView('pdf');
              }}
            />
            <DesktopButton
              active={view === 'desktop'}
              onClick={() => {
                setView('desktop');
              }}
            />
          </Box>
        )}
        <ReportContextProvider
          reportId={reportId}
          width={view}
          phaseId={phaseId}
        >
          <LanguageProvider
            contentBuilderLocale={selectedLocale}
            platformLocale={platformLocale}
          >
            {view === 'pdf' ? (
              <Box
                width={`calc(${A4_WIDTH} + 40px)`}
                height="calc(100vh - 200px)"
                overflowY="scroll"
              >
                <PDFWrapper>
                  <Frame editorData={previewData} />
                </PDFWrapper>
              </Box>
            ) : (
              <Box
                height="620px"
                border="solid black"
                borderWidth="40px 20px 20px 20px"
                zIndex="1"
                mb="12px"
                width={view === 'phone' ? '360px' : '1140px'}
                py={view === 'phone' ? '20px' : '40px'}
                borderRadius="20px"
                overflowX="hidden"
                overflowY="scroll"
                background="white"
                display="flex"
                alignItems="center"
                flexDirection="column"
              >
                <Box maxWidth={MAX_REPORT_WIDTH} w="100%">
                  <Frame editorData={previewData} />
                </Box>
              </Box>
            )}
          </LanguageProvider>
        </ReportContextProvider>
      </Box>
    </Box>
  );
};

export default EditModePreview;
