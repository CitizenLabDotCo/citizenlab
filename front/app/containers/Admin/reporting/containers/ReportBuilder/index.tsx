import React, { useState, useCallback } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useReportLayout from 'api/report_layout/useReportLayout';
import useLocale from 'hooks/useLocale';

// context
import { ReportContextProvider } from '../../context/ReportContext';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import Editor from '../../components/ReportBuilder/Editor';
import TopBar from '../../components/ReportBuilder/TopBar';
import Toolbox from '../../components/ReportBuilder/Toolbox';
import { StyledRightColumn } from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import Frame from 'components/admin/ContentBuilder/Frame';
import Settings from 'components/admin/ContentBuilder/Settings';

// templates
import ProjectTemplate from '../../components/ReportBuilder/Templates/ProjectTemplate';

// styling
import { stylingConsts } from 'utils/styleUtils';

// constants
import { A4_WIDTH } from '../../constants';

// typings
import {
  CraftJson,
  ContentBuilderErrors,
} from 'components/admin/ContentBuilder/typings';
import { SerializedNodes } from '@craftjs/core';
import { Locale } from 'typings';
import { ReportLayout } from 'api/report_layout/types';

interface Props {
  reportId: string;
  reportLayout: ReportLayout;
}

const ReportBuilder = ({ reportId, reportLayout }: Props) => {
  const platformLocale = useLocale();
  const [search] = useSearchParams();
  const templateProjectId = search.get('templateProjectId');

  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedLocale, _setSelectedLocale] = useState<Locale>(platformLocale);
  const [draftData, setDraftData] = useState<CraftJson>();
  const [initialData] = useState<CraftJson>(
    reportLayout.attributes.craftjs_json
  );
  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});

  const handleEditorChange = useCallback((nodes: SerializedNodes) => {
    if (Object.keys(nodes).length === 1 && nodes.ROOT) return;
    setDraftData(nodes);
  }, []);

  const handleErrors = (newErrors: ContentBuilderErrors) => {
    setContentBuilderErrors((contentBuilderErrors) => ({
      ...contentBuilderErrors,
      ...newErrors,
    }));
  };

  const handleDeleteElement = (id: string) => {
    setContentBuilderErrors((contentBuilderErrors) => {
      const { [id]: _id, ...rest } = contentBuilderErrors;
      return rest;
    });
  };

  const previewData = draftData ?? initialData;
  const hasError =
    Object.values(contentBuilderErrors).filter((node) => node.hasError).length >
    0;

  return (
    <ReportContextProvider width="pdf" reportId={reportId}>
      <FullscreenContentBuilder
        onErrors={handleErrors}
        onDeleteElement={handleDeleteElement}
        onUploadImage={setImageUploading}
      >
        <Editor
          isPreview={false}
          onNodesChange={handleEditorChange}
          key={selectedLocale}
        >
          <TopBar
            hasError={hasError}
            hasPendingState={imageUploading}
            previewEnabled={previewEnabled}
            setPreviewEnabled={setPreviewEnabled}
            selectedLocale={selectedLocale}
            draftEditorData={draftData}
            initialData={initialData}
            reportId={reportId}
            templateProjectId={templateProjectId ?? undefined}
          />
          <Box
            mt={`${stylingConsts.menuHeight}px`}
            display={previewEnabled ? 'none' : 'flex'}
          >
            <Toolbox reportId={reportId} />
            <StyledRightColumn>
              <Box width={A4_WIDTH}>
                <Box
                  background="white"
                  px="30px"
                  py="30px"
                  width="100%"
                  height="100%"
                >
                  <LanguageProvider
                    contentBuilderLocale={selectedLocale}
                    platformLocale={platformLocale}
                  >
                    <Frame editorData={initialData}>
                      {templateProjectId && (
                        <ProjectTemplate
                          reportId={reportId}
                          projectId={templateProjectId}
                        />
                      )}
                    </Frame>
                  </LanguageProvider>
                </Box>
              </Box>
            </StyledRightColumn>
            <Settings />
          </Box>
        </Editor>
        {previewEnabled && (
          <Box
            width="100%"
            height="100%"
            display="flex"
            justifyContent="center"
            mt={`${stylingConsts.menuHeight}px`}
            pb="100px"
          >
            <StyledRightColumn>
              <Box width={A4_WIDTH} background="white" px={'15mm'} py={'15mm'}>
                <Editor isPreview={true}>
                  <LanguageProvider
                    contentBuilderLocale={selectedLocale}
                    platformLocale={platformLocale}
                  >
                    <Frame editorData={previewData} />
                  </LanguageProvider>
                </Editor>
              </Box>
            </StyledRightColumn>
          </Box>
        )}
      </FullscreenContentBuilder>
    </ReportContextProvider>
  );
};

const ReportBuilderWrapper = () => {
  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  const { pathname } = useLocation();
  const { reportId } = useParams();
  const { data: reportLayout } = useReportLayout(reportId);

  const renderReportBuilder =
    reportBuilderEnabled &&
    pathname.includes('admin/reporting/report-builder') &&
    reportId !== undefined &&
    reportLayout;

  if (!renderReportBuilder) return null;

  return <ReportBuilder reportId={reportId} reportLayout={reportLayout.data} />;
};

export default ReportBuilderWrapper;
