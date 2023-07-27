import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useReportLayout from 'api/report_layout/useReportLayout';
import useReportLocale from '../../hooks/useReportLocale';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import Editor from '../../components/ReportBuilder/Editor';
import TopBar from '../../components/ReportBuilder/TopBar';
import Toolbox from '../../components/ReportBuilder/Toolbox';
import {
  StyledRightColumn,
  ErrorMessage,
} from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import Frame from 'components/admin/ContentBuilder/Frame';
import Settings from 'components/admin/ContentBuilder/Settings';

// templates
import ProjectTemplate from '../../components/ReportBuilder/Templates/ProjectTemplate';

// styling
import { stylingConsts } from 'utils/styleUtils';

// utils
import { isNilOrError } from 'utils/helperUtils';

// constants
import { A4_WIDTH } from '../../constants';

// typings
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import { SerializedNodes } from '@craftjs/core';
import { Locale } from 'typings';
import ReportLanguageProvider from '../ReportLanguageProvider';
import useLocale from '../../../../../hooks/useLocale';

interface Props {
  reportId: string;
}

const ReportBuilder = ({ reportId }: Props) => {
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale | undefined>();
  const [draftData, setDraftData] = useState<Record<string, SerializedNodes>>();
  const { data: reportLayout } = useReportLayout(reportId);
  const reportLocale = useReportLocale(reportLayout?.data);
  const platformLocale = useLocale();
  const [initialized, setInitialized] = useState(false);
  const [initialData, setInitialData] = useState<SerializedNodes | undefined>();
  const [search] = useSearchParams();
  const projectId = search.get('projectId');

  // Note: selectedLocale is kept to keep compatibility with content builder
  // although there is currently only one locale allowed per report
  useEffect(() => {
    if (!isNilOrError(reportLocale)) {
      setSelectedLocale(reportLocale);
    }
  }, [reportLocale]);

  const localesWithError = useMemo(() => {
    return Object.values(contentBuilderErrors)
      .filter((node) => node.hasError)
      .map((node) => node.selectedLocale);
  }, [contentBuilderErrors]);

  const handleErrors = useCallback((newErrors: ContentBuilderErrors) => {
    setContentBuilderErrors((contentBuilderErrors) => ({
      ...contentBuilderErrors,
      ...newErrors,
    }));
  }, []);

  const handleDeleteElement = useCallback((id: string) => {
    setContentBuilderErrors((contentBuilderErrors) => {
      const { [id]: _id, ...rest } = contentBuilderErrors;
      return rest;
    });
  }, []);

  const handleEditorChange = useCallback(
    (nodes: SerializedNodes) => {
      if (Object.keys(nodes).length === 1 && nodes.ROOT) return;
      if (!selectedLocale) return;
      setDraftData((draftData) => ({
        ...draftData,
        [selectedLocale]: nodes,
      }));
    },
    [selectedLocale]
  );

  const previewData = useMemo(() => {
    if (!selectedLocale) return;

    const previewData = draftData ? draftData[selectedLocale] : undefined;
    return previewData;
  }, [draftData, selectedLocale]);

  useEffect(() => {
    if (initialized) return;
    if (!selectedLocale) return;
    if (reportLayout === undefined) return;

    if (!isNilOrError(reportLayout)) {
      setInitialData(
        reportLayout.data.attributes.craftjs_jsonmultiloc[selectedLocale]
      );
    }

    setInitialized(true);
  }, [initialized, selectedLocale, reportLayout]);

  if (!selectedLocale) return null;

  return (
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
          localesWithError={localesWithError}
          hasPendingState={imageUploading}
          previewEnabled={previewEnabled}
          setPreviewEnabled={setPreviewEnabled}
          selectedLocale={selectedLocale}
          draftEditorData={draftData}
          initialData={initialData}
          reportId={reportId}
          projectId={projectId ?? undefined}
        />
        <Box
          mt={`${stylingConsts.menuHeight}px`}
          display={previewEnabled ? 'none' : 'flex'}
        >
          {selectedLocale && <Toolbox reportId={reportId} />}
          <StyledRightColumn>
            <Box width={A4_WIDTH}>
              <ErrorMessage localesWithError={localesWithError} />
              <Box
                background="white"
                px="30px"
                py="30px"
                width="100%"
                height="100%"
              >
                <ReportLanguageProvider
                  reportLocale={reportLocale}
                  platformLocale={platformLocale}
                >
                  <Frame editorData={initialData}>
                    {projectId && (
                      <ProjectTemplate
                        reportId={reportId}
                        projectId={projectId}
                      />
                    )}
                  </Frame>
                </ReportLanguageProvider>
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
                <ReportLanguageProvider
                  reportLocale={reportLocale}
                  platformLocale={platformLocale}
                >
                  <Frame editorData={previewData} />
                </ReportLanguageProvider>
              </Editor>
            </Box>
          </StyledRightColumn>
        </Box>
      )}
    </FullscreenContentBuilder>
  );
};

const ReportBuilderWrapper = () => {
  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  const { pathname } = useLocation();
  const { reportId } = useParams();

  const renderReportBuilder =
    reportBuilderEnabled &&
    pathname.includes('admin/reporting/report-builder') &&
    reportId !== undefined;

  if (!renderReportBuilder) return null;

  return <ReportBuilder reportId={reportId} />;
};

export default ReportBuilderWrapper;
