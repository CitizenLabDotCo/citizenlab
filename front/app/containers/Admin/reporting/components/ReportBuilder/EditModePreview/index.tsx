import React, { useState } from 'react';

// components
import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import MobileButton from 'components/admin/ContentBuilder/EditModePreview/ViewButtons/MobileButton';
import PDFButton from './PDFButton';
import DesktopButton from 'components/admin/ContentBuilder/EditModePreview/ViewButtons/DesktopButton';
import Editor from '../Editor';
import Frame from 'components/admin/ContentBuilder/Frame';

// hooks
import useLocale from 'hooks/useLocale';

// context
import { ReportContextProvider } from 'containers/Admin/reporting/context/ReportContext';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';

// constants
import { MAX_REPORT_WIDTH } from 'containers/Admin/reporting/constants';

// typings
import { Locale } from 'typings';
import { CraftJson } from 'components/admin/ContentBuilder/typings';

interface Props {
  reportId: string;
  previewData?: CraftJson;
  selectedLocale: Locale;
}

type View = 'mobile' | 'pdf' | 'desktop';

const EditModePreview = ({ reportId, previewData, selectedLocale }: Props) => {
  const [view, setView] = useState<View>('mobile');
  const platformLocale = useLocale();

  return (
    <Box
      mt={`${stylingConsts.menuHeight + 20}px`}
      minHeight={`calc(100vh - ${2 * stylingConsts.menuHeight + 20}px)`}
      justifyContent="center"
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        <Box display="flex" mb="16px">
          <MobileButton
            active={view === 'mobile'}
            onClick={() => {
              setView('mobile');
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
        <ReportContextProvider reportId={reportId} width={view}>
          <LanguageProvider
            contentBuilderLocale={selectedLocale}
            platformLocale={platformLocale}
          >
            <Box
              height="620px"
              border="solid black"
              borderWidth="40px 20px 20px 20px"
              zIndex="1"
              mb="12px"
              width={view === 'mobile' ? '360px' : '1140px'}
              borderRadius="20px"
              overflowY="scroll"
              background="white"
              display="flex"
              alignItems="center"
              flexDirection="column"
            >
              <Box maxWidth={MAX_REPORT_WIDTH} w="100%">
                <Editor isPreview={true}>
                  <Frame editorData={previewData} />
                </Editor>
              </Box>
            </Box>
          </LanguageProvider>
        </ReportContextProvider>
      </Box>
    </Box>
  );
};

export default EditModePreview;
