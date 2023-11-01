import React, { useState, useRef, useEffect } from 'react';

// styles
import { stylingConsts } from 'utils/styleUtils';

// components
import { Box } from '@citizenlab/cl2-component-library';
import ProjectDescriptionBuilderEditModePreview from '../components/ProjectDescriptionBuilderEditModePreview';

// craft
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import Editor from '../components/Editor';
import ProjectDescriptionBuilderToolbox from '../components/ProjectDescriptionBuilderToolbox';
import ProjectDescriptionBuilderTopBar from '../components/ProjectDescriptionBuilderTopBar';
import {
  StyledRightColumn,
  ErrorMessage,
} from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import ContentBuilderSettings from 'components/admin/ContentBuilder/Settings';

// hooks
import useLocale from 'hooks/useLocale';
import useHomepageSettings from 'api/home_page/useHomepageSettings';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { SerializedNodes } from '@craftjs/core';
import { Locale } from 'typings';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import { isEmpty } from 'lodash-es';
import ContentBuilderLanguageProvider from './ContentBuilderLanguageProvider';

const ProjectDescriptionBuilderPage = () => {
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale | undefined>();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const locale = useLocale();
  const locales = useAppConfigurationLocales();
  const { data: homepageSettings } = useHomepageSettings();

  useEffect(() => {
    if (!isNilOrError(locale)) {
      setSelectedLocale(locale);
    }
  }, [locale]);

  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});

  const [imageUploading, setImageUploading] = useState(false);

  if (isNilOrError(locales)) {
    return null;
  }

  const localesWithError = Object.values(contentBuilderErrors)
    .filter((node) => node.hasError)
    .map((node) => node.selectedLocale);

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
      homepageSettings &&
      !isEmpty(homepageSettings.data.attributes.craftjs_json)
    ) {
      return homepageSettings.data.attributes.craftjs_json;
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
    locale: Locale;
    editorData: SerializedNodes;
  }) => {
    // iframeRef.current &&
    //   iframeRef.current.contentWindow &&
    //   iframeRef.current.contentWindow.postMessage(
    //     { selectedLocale: locale },
    //     window.location.href
    //   );

    setSelectedLocale(locale);
  };

  return (
    <FullscreenContentBuilder
      onErrors={handleErrors}
      onDeleteElement={handleDeleteElement}
      onUploadImage={setImageUploading}
    >
      <Editor isPreview={false} onNodesChange={handleEditorChange}>
        <ProjectDescriptionBuilderTopBar
          localesWithError={localesWithError}
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
          {selectedLocale && (
            <ProjectDescriptionBuilderToolbox selectedLocale={selectedLocale} />
          )}
          <StyledRightColumn>
            <ContentBuilderLanguageProvider
              contentBuilderLocale={selectedLocale}
              platformLocale={locale}
            >
              <Box width="1000px">
                <ErrorMessage localesWithError={localesWithError} />
                <ContentBuilderFrame editorData={getEditorData()} />
              </Box>
            </ContentBuilderLanguageProvider>
          </StyledRightColumn>
          <ContentBuilderSettings />
        </Box>
      </Editor>
      <Box justifyContent="center" display={previewEnabled ? 'flex' : 'none'}>
        <ProjectDescriptionBuilderEditModePreview ref={iframeRef} />
      </Box>
    </FullscreenContentBuilder>
  );
};

export default ProjectDescriptionBuilderPage;
