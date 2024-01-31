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
import Settings from '../../components/ReportBuilder/Settings';
import PDFWrapper from '../../components/ReportBuilder/EditModePreview/PDFWrapper';

// templates
import ProjectTemplate from '../../components/ReportBuilder/Templates/ProjectTemplate';

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

  // initialData is needed for the Frame, to have the correct initial data
  // when it first loads. After this initial render, craftjs maintains its state
  // internally, so we don't need to update it anymore.
  // If you try to update initial data after this initial render, it will just lead
  // to an infinite state update loop.
  // HOWEVER, when switching back and forth between the preview, the Frame
  // will unmount and remount. At this moment, it needs to have the latest data.
  // So only in this case do we need to update initialData.
  // That's why we do it when you switch to preview mode, so that when you switch
  // back later, it's already up to date.
  // Very tricky behavior of craftjs. Ask me (Luuc) if you have any questions.
  const [initialData, setInitialData] = useState(
    isEmpty(draftData) ? undefined : draftData
  );

  const handlePreview = () => {
    setPreviewEnabled((previewEnabled) => {
      const nextState = !previewEnabled;
      const userSwitchingToPreview = nextState === true;

      if (userSwitchingToPreview) {
        setInitialData(draftData);
      }

      return nextState;
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
          isPreview={previewEnabled}
          onNodesChange={handleEditorChange}
          key={selectedLocale}
        >
          <TopBar
            hasError={hasError}
            hasPendingState={imageUploading}
            previewEnabled={previewEnabled}
            selectedLocale={selectedLocale}
            reportId={reportId}
            templateProjectId={templateProjectId ?? undefined}
            saved={saved}
            setSaved={setSaved}
            setPreviewEnabled={handlePreview}
            setSelectedLocale={setSelectedLocale}
          />
          {!previewEnabled && (
            <Box mt={`${stylingConsts.menuHeight}px`}>
              <Toolbox reportId={reportId} />
              <LanguageProvider
                contentBuilderLocale={selectedLocale}
                platformLocale={platformLocale}
              >
                <StyledRightColumn>
                  <PDFWrapper>
                    <Frame editorData={initialData}>
                      {templateProjectId && (
                        <ProjectTemplate
                          reportId={reportId}
                          projectId={templateProjectId}
                        />
                      )}
                    </Frame>
                  </PDFWrapper>
                </StyledRightColumn>
              </LanguageProvider>
              <Settings />
            </Box>
          )}
          {previewEnabled && (
            <Box justifyContent="center">
              <EditModePreview
                previewData={previewData}
                selectedLocale={selectedLocale}
              />
            </Box>
          )}
        </Editor>
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
