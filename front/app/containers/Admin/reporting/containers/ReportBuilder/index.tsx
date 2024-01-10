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
import { Box, stylingConsts } from '@citizenlab/cl2-component-library';

// craft
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import Editor from '../../components/ReportBuilder/Editor';
import TopBar from '../../components/ReportBuilder/TopBar';
import Toolbox from '../../components/ReportBuilder/Toolbox';
import { StyledRightColumn } from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import Frame from 'components/admin/ContentBuilder/Frame';
import EditModePreview from '../../components/ReportBuilder/EditModePreview';
import Settings from 'components/admin/ContentBuilder/Settings';

// templates
import ProjectTemplate from '../../components/ReportBuilder/Templates/ProjectTemplate';

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
import { isEmpty } from 'lodash-es';

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
  const [selectedLocale, setSelectedLocale] = useState<Locale>(platformLocale);
  const [draftData, setDraftData] = useState<CraftJson>(
    reportLayout.attributes.craftjs_json
  );

  // Absolutely no idea why we need this initial data stuff.
  // But without it the whole report builder crashes. Seems to be weird
  // behaviour from the craftjs library.
  const [initialData] = useState(isEmpty(draftData) ? undefined : draftData);

  const [saved, setSaved] = useState(!templateProjectId);
  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});

  const handleEditorChange = useCallback((nodes: SerializedNodes) => {
    if (Object.keys(nodes).length === 1 && nodes.ROOT) return;
    setDraftData(nodes);
    setSaved(false);
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

  const previewData = isEmpty(draftData) ? undefined : draftData;

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
            selectedLocale={selectedLocale}
            draftEditorData={previewData}
            reportId={reportId}
            templateProjectId={templateProjectId ?? undefined}
            saved={saved}
            setSaved={setSaved}
            setPreviewEnabled={setPreviewEnabled}
            setSelectedLocale={setSelectedLocale}
          />
          <Box
            mt={`${stylingConsts.menuHeight}px`}
            display={previewEnabled ? 'none' : 'flex'}
          >
            <Toolbox reportId={reportId} />
            <LanguageProvider
              contentBuilderLocale={selectedLocale}
              platformLocale={platformLocale}
            >
              <StyledRightColumn>
                <Box width={A4_WIDTH}>
                  <Box
                    background="white"
                    px="30px"
                    py="30px"
                    width="100%"
                    height="100%"
                  >
                    <Frame editorData={initialData}>
                      {templateProjectId && (
                        <ProjectTemplate
                          reportId={reportId}
                          projectId={templateProjectId}
                        />
                      )}
                    </Frame>
                  </Box>
                </Box>
              </StyledRightColumn>
            </LanguageProvider>
            <Settings />
          </Box>
        </Editor>
        <Box justifyContent="center" display={previewEnabled ? 'flex' : 'none'}>
          <EditModePreview
            selectedLocale={selectedLocale}
            previewData={previewData}
          />
        </Box>
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
