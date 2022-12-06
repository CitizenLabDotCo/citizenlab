import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useLocation } from 'react-router-dom';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import Editor from '../components/Editor';
import TopBar from '../components/TopBar';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import { SerializedNodes } from '@craftjs/core';
import { Locale } from 'typings';

const ReportBuilder = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale | undefined>();
  const [draftData, setDraftData] = useState<Record<string, SerializedNodes>>();
  const locale = useLocale();

  useEffect(() => {
    if (!isNilOrError(locale)) {
      setSelectedLocale(locale);
    }
  }, [locale]);

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

  const handleEditorChange = useCallback((nodes: SerializedNodes) => {
    iframeRef.current &&
      iframeRef.current.contentWindow &&
      iframeRef.current.contentWindow.postMessage(nodes, window.location.href);
  }, []);

  const handleSelectedLocaleChange = useCallback(
    ({
      locale,
      editorData,
    }: {
      locale: Locale;
      editorData: SerializedNodes;
    }) => {
      if (selectedLocale && selectedLocale !== locale) {
        setDraftData({ ...draftData, [selectedLocale]: editorData });
      }

      iframeRef.current &&
        iframeRef.current.contentWindow &&
        iframeRef.current.contentWindow.postMessage(
          { selectedLocale: locale },
          window.location.href
        );

      setSelectedLocale(locale);
    },
    []
  );

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
        />
        <Box p="20px">Hello world!</Box>
      </Editor>
    </FullscreenContentBuilder>
  );
};

const ReportBuilderWrapper = () => {
  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  const { pathname } = useLocation();

  const renderReportBuilder =
    reportBuilderEnabled && pathname.includes('admin/report-builder');

  if (!renderReportBuilder) return null;

  return <ReportBuilder />;
};

export default ReportBuilderWrapper;
