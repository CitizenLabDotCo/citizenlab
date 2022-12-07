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
import Editor from '../../components/ReportBuilder/Editor';
import TopBar from '../../components/ReportBuilder/TopBar';
import Toolbox from '../../components/ReportBuilder/Toolbox';
import FrameWrapper from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import Frame from 'components/admin/ContentBuilder/Frame';
import Settings from 'components/admin/ContentBuilder/Settings';

// styling
import { stylingConsts } from 'utils/styleUtils';

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

  // TODO
  const contentBuilderLayout: any = undefined;

  const getEditorData = useCallback(() => {
    if (!isNilOrError(contentBuilderLayout) && selectedLocale) {
      if (draftData && draftData[selectedLocale]) {
        return draftData[selectedLocale];
      } else {
        return contentBuilderLayout.data.attributes.craftjs_jsonmultiloc[
          selectedLocale
        ];
      }
    } else return undefined;
  }, [contentBuilderLayout, selectedLocale, draftData]);

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
        setDraftData((draftData) => ({
          ...draftData,
          [selectedLocale]: editorData,
        }));
      }

      iframeRef.current &&
        iframeRef.current.contentWindow &&
        iframeRef.current.contentWindow.postMessage(
          { selectedLocale: locale },
          window.location.href
        );

      setSelectedLocale(locale);
    },
    [selectedLocale]
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
        <Box
          mt={`${stylingConsts.menuHeight}px`}
          display={previewEnabled ? 'none' : 'flex'}
        >
          {selectedLocale && <Toolbox selectedLocale={selectedLocale} />}
          <FrameWrapper localesWithError={localesWithError}>
            <Frame editorData={getEditorData()} />
          </FrameWrapper>
          <Settings />
        </Box>
      </Editor>
    </FullscreenContentBuilder>
  );
};

const ReportBuilderWrapper = () => {
  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  const { pathname } = useLocation();

  const renderReportBuilder =
    reportBuilderEnabled && pathname.includes('admin/reporting/report-creator');

  if (!renderReportBuilder) return null;

  return <ReportBuilder />;
};

export default ReportBuilderWrapper;
