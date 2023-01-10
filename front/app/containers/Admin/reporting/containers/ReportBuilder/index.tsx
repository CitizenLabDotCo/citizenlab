import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useReportLayout from 'hooks/useReportLayout';
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

// styling
import { stylingConsts } from 'utils/styleUtils';

// utils
import { isNilOrError } from 'utils/helperUtils';

// constants
import { A4_WIDTH, A4_MARGIN_X, A4_MARGIN_Y } from '../../constants';

// typings
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import { SerializedNodes } from '@craftjs/core';
import { Locale } from 'typings';
import ReportLanguageProvider from '../ReportLanguageProvider';

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
  const reportLayout = useReportLayout(reportId);
  const reportLocale = useReportLocale(reportLayout);

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

  // Note: Currently unused - probably needs removing
  const handleSelectedLocaleChange = useCallback(
    ({
      locale,
      editorData,
    }: {
      locale: Locale;
      editorData: SerializedNodes;
    }) => {
      if (selectedLocale && selectedLocale !== locale) {
        setDraftData((draftData) => ({
          ...draftData,
          [selectedLocale]: editorData,
        }));
      }

      setSelectedLocale(locale);
    },
    [selectedLocale]
  );

  const previewData = useMemo(() => {
    if (!selectedLocale) return;

    const previewData = draftData ? draftData[selectedLocale] : undefined;
    return previewData;
  }, [draftData, selectedLocale]);

  if (!selectedLocale) return null;

  const initialData = isNilOrError(reportLayout)
    ? undefined
    : reportLayout.attributes.craftjs_jsonmultiloc[selectedLocale];

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
          onSelectLocale={handleSelectedLocaleChange}
          draftEditorData={draftData}
          reportId={reportId}
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
                px={A4_MARGIN_X}
                py={A4_MARGIN_Y}
                width="100%"
                height="100%"
              >
                <ReportLanguageProvider locale={reportLocale}>
                  <Frame editorData={initialData} />
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
                <ReportLanguageProvider locale={reportLocale}>
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
