import React, { useState, useRef, useCallback } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { isEmpty } from 'lodash-es';
import { useLocation } from 'react-router-dom';
import { RouteType } from 'routes';
import { Multiloc, SupportedLocale } from 'typings';

import { ContentBuildableType } from 'api/content_builder/types';
import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { StyledRightColumn } from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import DescriptionBuilderEditModePreview from 'components/DescriptionBuilder/DescriptionBuilderEditModePreview';
import DescriptionBuilderToolbox from 'components/DescriptionBuilder/DescriptionBuilderToolbox';
import DescriptionBuilderTopBar from 'components/DescriptionBuilder/DescriptionBuilderTopBar';
import Editor from 'components/DescriptionBuilder/Editor';
import ContentBuilderSettings from 'components/DescriptionBuilder/Settings';

import { isNilOrError } from 'utils/helperUtils';

type Props = {
  contentBuildableId: string;
  contentBuildableType: ContentBuildableType;
  backPath: RouteType;
  previewPath: RouteType;
  titleMultiloc: Multiloc;
};

const DescriptionBuilderPage = ({
  contentBuildableId,
  contentBuildableType,
  backPath,
  previewPath,
  titleMultiloc,
}: Props) => {
  const locale = useLocale();
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [draftData, setDraftData] = useState<Record<string, SerializedNodes>>();
  const { pathname } = useLocation();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const locales = useAppConfigurationLocales();

  const { data: descriptionBuilderLayout } = useContentBuilderLayout(
    contentBuildableType,
    contentBuildableId
  );

  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});

  const [imageUploading, setImageUploading] = useState(false);

  const descriptionBuilderVisible =
    featureEnabled && pathname.includes('admin/description-builder');

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

  if (
    isNilOrError(locales) ||
    !descriptionBuilderVisible ||
    !descriptionBuilderLayout
  ) {
    return null;
  }

  const hasError =
    Object.values(contentBuilderErrors).filter((node) => node.hasError).length >
    0;

  const getEditorData = () => {
    if (!isEmpty(descriptionBuilderLayout.data.attributes.craftjs_json)) {
      return descriptionBuilderLayout.data.attributes.craftjs_json;
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
    editorData,
  }: {
    locale: SupportedLocale;
    editorData: SerializedNodes;
  }) => {
    if (selectedLocale !== locale) {
      setDraftData({ ...draftData, [selectedLocale]: editorData });
    }

    iframeRef.current &&
      iframeRef.current.contentWindow &&
      iframeRef.current.contentWindow.postMessage(
        { selectedLocale: locale },
        window.location.href
      );

    setSelectedLocale(locale);
  };

  return (
    <ContentBuilderLayoutProvider layoutId={descriptionBuilderLayout.data.id}>
      <FullscreenContentBuilder
        onErrors={handleErrors}
        onDeleteElement={handleDeleteElement}
        onUploadImage={setImageUploading}
      >
        <Editor isPreview={false} onNodesChange={handleEditorChange}>
          <DescriptionBuilderTopBar
            hasError={hasError}
            hasPendingState={imageUploading}
            previewEnabled={previewEnabled}
            setPreviewEnabled={setPreviewEnabled}
            selectedLocale={selectedLocale}
            onSelectLocale={handleSelectedLocaleChange}
            contentBuildableId={contentBuildableId}
            contentBuildableType={contentBuildableType}
            backPath={backPath}
            previewPath={previewPath}
            titleMultiloc={titleMultiloc}
          />
          <Box
            mt={`${stylingConsts.menuHeight}px`}
            display={previewEnabled ? 'none' : 'flex'}
            id="e2e-project-description-content-builder-page"
          >
            <DescriptionBuilderToolbox
              contentBuildableType={contentBuildableType}
              contentBuildableId={contentBuildableId}
              selectedLocale={selectedLocale}
            />
            <LanguageProvider
              contentBuilderLocale={selectedLocale}
              platformLocale={locale}
            >
              <StyledRightColumn>
                <Box width="1000px">
                  <ContentBuilderFrame editorData={getEditorData()} />
                </Box>
              </StyledRightColumn>
            </LanguageProvider>
            <ContentBuilderSettings />
          </Box>
        </Editor>
        <Box justifyContent="center" display={previewEnabled ? 'flex' : 'none'}>
          <DescriptionBuilderEditModePreview
            contentBuildableId={contentBuildableId}
            contentBuildableType={contentBuildableType}
            ref={iframeRef}
            selectedLocale={selectedLocale}
          />
        </Box>
      </FullscreenContentBuilder>
    </ContentBuilderLayoutProvider>
  );
};

export default DescriptionBuilderPage;
