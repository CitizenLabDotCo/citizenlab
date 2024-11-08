import React, { useState, useRef } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { isEmpty } from 'lodash-es';
import { SupportedLocale } from 'typings';

import useHomepageLayout from 'api/home_page_layout/useHomepageLayout';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { StyledRightColumn } from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';

import { isNilOrError } from 'utils/helperUtils';

import Editor from '../components/Editor';
import HomepageBuilderEditModePreview from '../components/HomepageBuilderEditModePreview';
import HomepageBuilderToolbox from '../components/HomepageBuilderToolbox';
import HomepageBuilderTopBar from '../components/HomepageBuilderTopBar';
import Settings from '../components/Settings';

const HomepageBuilderPage = () => {
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const locale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(locale);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const locales = useAppConfigurationLocales();
  const { data: homepageLayout } = useHomepageLayout();

  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});

  const [imageUploading, setImageUploading] = useState(false);

  if (isNilOrError(locales)) {
    return null;
  }

  const hasError =
    Object.values(contentBuilderErrors).filter((node) => node.hasError).length >
    0;

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
        <HomepageBuilderTopBar
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
          <HomepageBuilderToolbox selectedLocale={selectedLocale} />
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
        <HomepageBuilderEditModePreview
          ref={iframeRef}
          selectedLocale={selectedLocale}
        />
      </Box>
    </FullscreenContentBuilder>
  );
};

export default HomepageBuilderPage;
