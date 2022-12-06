import React, { useState, useRef, useCallback } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { Box } from '@citizenlab/cl2-component-library';

// craft
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import Editor from '../components/Editor';

// typings
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import { SerializedNodes } from '@craftjs/core';
import { Locale } from 'typings';

const ReportBuilder = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale | undefined>();

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
        <Box p="20px">Hello world!</Box>
      </Editor>
    </FullscreenContentBuilder>
  );
};

const ReportBuilderWrapper = () => {
  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  if (!reportBuilderEnabled) return null;

  return <ReportBuilder />;
};

export default ReportBuilderWrapper;
