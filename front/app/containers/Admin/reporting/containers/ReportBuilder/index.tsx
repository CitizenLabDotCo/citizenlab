import React, { useState, useCallback } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { isEmpty } from 'lodash-es';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Locale } from 'typings';

import Frame from 'components/admin/ContentBuilder/Frame';
import { StyledRightColumn } from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import {
  CraftJson,
  ContentBuilderErrors,
} from 'components/admin/ContentBuilder/typings';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import { ReportLayout } from 'api/report_layout/types';
import useReportLayout from 'api/report_layout/useReportLayout';
import { ReportResponse } from 'api/reports/types';
import useReport from 'api/reports/useReport';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

// context
import EditModePreview from '../../components/ReportBuilder/EditModePreview';
import PDFWrapper from '../../components/ReportBuilder/EditModePreview/PDFWrapper';
import Editor from '../../components/ReportBuilder/Editor';
import Settings from '../../components/ReportBuilder/Settings';

// templates
import PhaseTemplate from '../../components/ReportBuilder/Templates/PhaseTemplate';
import ProjectTemplate from '../../components/ReportBuilder/Templates/ProjectTemplate';
import Toolbox from '../../components/ReportBuilder/Toolbox';
import TopBar from '../../components/ReportBuilder/TopBar';
import { ReportContextProvider } from '../../context/ReportContext';

interface Props {
  report: ReportResponse;
  reportLayout: ReportLayout;
}

const ReportBuilder = ({ report, reportLayout }: Props) => {
  const reportId = report.data.id;
  const phaseId = report.data.relationships.phase?.data?.id;

  const platformLocale = useLocale();
  const [search] = useSearchParams();
  const templateProjectId = search.get('templateProjectId');
  const templatePhaseId = search.get('templatePhaseId');
  const previewEnabled = search.get('preview') === 'true';

  const [imageUploading, setImageUploading] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(platformLocale);
  const [draftData, setDraftData] = useState<CraftJson>(
    reportLayout.attributes.craftjs_json
  );

  const [saved, setSaved] = useState(!templateProjectId);
  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});

  const handleEditorChange = useCallback(
    (nodes: SerializedNodes) => {
      if (previewEnabled) return;
      setDraftData(nodes);
      setSaved(false);
    },
    [previewEnabled]
  );

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
    const nextState = !previewEnabled;
    const userSwitchingToPreview = nextState === true;

    if (userSwitchingToPreview) {
      setInitialData(draftData);
    }

    nextState
      ? updateSearchParams({ preview: 'true' })
      : removeSearchParams(['preview']);
  };

  const previewData = isEmpty(draftData) ? undefined : draftData;

  const hasError =
    Object.values(contentBuilderErrors).filter((node) => node.hasError).length >
    0;

  return (
    <ReportContextProvider width="pdf" reportId={reportId} phaseId={phaseId}>
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
            isTemplate={!!templateProjectId || !!templatePhaseId}
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
                      {templateProjectId ? (
                        <ProjectTemplate
                          reportId={reportId}
                          projectId={templateProjectId}
                        />
                      ) : templatePhaseId ? (
                        <PhaseTemplate phaseId={templatePhaseId} />
                      ) : null}
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
  const { data: report } = useReport(reportId);
  const { data: reportLayout } = useReportLayout(reportId);

  const renderReportBuilder =
    reportBuilderEnabled &&
    pathname.includes('admin/reporting/report-builder') &&
    reportId !== undefined &&
    report &&
    reportLayout;

  if (!renderReportBuilder) return null;

  return <ReportBuilder report={report} reportLayout={reportLayout.data} />;
};

export default ReportBuilderWrapper;
