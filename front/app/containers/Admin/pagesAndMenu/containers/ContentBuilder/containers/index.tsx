import React, { useState, useRef, useCallback } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { isEmpty } from 'lodash-es';
import { SupportedLocale } from 'typings';

import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { StyledRightColumn } from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';

import { isNilOrError } from 'utils/helperUtils';

import EditModePreview from '../components/EditModePreview';
import Editor from '../components/Editor';
import Settings from '../components/Settings';
import Toolbox from '../components/Toolbox';
import TopBar from '../components/TopBar';

const HomepageBuilderPage = () => {
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const locale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(locale);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const locales = useAppConfigurationLocales();
  const { data: homepageLayout } = useContentBuilderLayout('homepage');

  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});

  const [imageUploading, setImageUploading] = useState(false);

  // DO NOT REMOVE THESE useCallbacks, without them the content builder
  // becomes horribly slow
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

  if (isNilOrError(locales)) {
    return null;
  }

  const hasError =
    Object.values(contentBuilderErrors).filter((node) => node.hasError).length >
    0;

  const getEditorData = () => {
    if (
      homepageLayout &&
      !isEmpty(homepageLayout.data.attributes.craftjs_json)
    ) {
      return homepageLayout.data.attributes.craftjs_json;
    } else {
      return undefined;
    }
  };

  const handleEditorChange = (nodes: SerializedNodes) => {
    iframeRef.current &&
      iframeRef.current.contentWindow &&
      iframeRef.current.contentWindow.postMessage(nodes, window.location.href);
  };

  const handleSelectedLocaleChange = ({
    locale,
  }: {
    locale: SupportedLocale;
    editorData: SerializedNodes;
  }) => {
    setSelectedLocale(locale);
  };

  return (
    <FullscreenContentBuilder
      onErrors={handleErrors}
      onDeleteElement={handleDeleteElement}
      onUploadImage={setImageUploading}
    >
      <Editor isPreview={false} onNodesChange={handleEditorChange}>
        <TopBar
          hasError={hasError}
          hasPendingState={imageUploading}
          previewEnabled={previewEnabled}
          setPreviewEnabled={setPreviewEnabled}
          selectedLocale={selectedLocale}
          onSelectLocale={handleSelectedLocaleChange}
        />
        <Box
          mt={`${stylingConsts.menuHeight}px`}
          display={previewEnabled ? 'none' : 'flex'}
        >
          <Toolbox />
          <StyledRightColumn>
            <LanguageProvider
              contentBuilderLocale={selectedLocale}
              platformLocale={locale}
            >
              <Box width="1000px">
                <ContentBuilderFrame editorData={getEditorData()} />
              </Box>
            </LanguageProvider>
          </StyledRightColumn>
          <Settings />
        </Box>
      </Editor>
      <Box justifyContent="center" display={previewEnabled ? 'flex' : 'none'}>
        <EditModePreview ref={iframeRef} selectedLocale={selectedLocale} />
      </Box>
    </FullscreenContentBuilder>
  );
};

export default HomepageBuilderPage;
