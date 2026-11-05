import React, { useState, useRef, useCallback } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { isEmpty } from 'lodash-es';
import { Multiloc, SupportedLocale } from 'typings';

import useAddContentBuilderLayout from 'api/content_builder/useAddContentBuilderLayout';
import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import DescriptionBuilderContent from 'components/DescriptionBuilder/DescriptionBuilderContent';
import DescriptionBuilderEditModePreview from 'components/DescriptionBuilder/DescriptionBuilderEditModePreview';
import FolderDescriptionBuilderToolbox from 'components/DescriptionBuilder/DescriptionBuilderToolbox/FolderDescriptionBuilderToolbox';
import DescriptionBuilderTopBar from 'components/DescriptionBuilder/DescriptionBuilderTopBar';
import Editor from 'components/DescriptionBuilder/Editor';
import ContentBuilderSettings from 'components/DescriptionBuilder/Settings';

import { type TypedLinkProps } from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
import { useLocation } from 'utils/router';

type Props = {
  contentBuildableId: string;
  backPath: string;
  previewLink: TypedLinkProps;
  titleMultiloc: Multiloc;
};

const DescriptionBuilderPage = ({
  contentBuildableId,
  backPath,
  previewLink,
  titleMultiloc,
}: Props) => {
  const locale = useLocale();
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [draftData, setDraftData] = useState<Record<string, SerializedNodes>>();
  const { pathname } = useLocation();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const locales = useAppConfigurationLocales();

  const { data: layout } = useContentBuilderLayout(
    'folder',
    contentBuildableId
  );

  const {
    mutate: addContentBuilderLayout,
    isPending: isAddingLayout,
    isError: isAddLayoutError,
  } = useAddContentBuilderLayout();

  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});

  const [imageUploading, setImageUploading] = useState(false);

  const descriptionBuilderVisible = pathname.includes(
    'admin/description-builder'
  );

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

  if (isNilOrError(locales) || !descriptionBuilderVisible || !layout) {
    return null;
  }

  const hasError =
    Object.values(contentBuilderErrors).filter((node) => node.hasError).length >
    0;

  const editorData = isEmpty(layout.data.attributes.craftjs_json)
    ? undefined
    : layout.data.attributes.craftjs_json;

  const handleSave = (nodes: SerializedNodes) => {
    addContentBuilderLayout({
      contentBuildableId,
      contentBuildableType: 'folder',
      enabled: true,
      craftjs_json: nodes,
    });
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
    <ContentBuilderLayoutProvider layoutId={layout.data.id}>
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
            backPath={backPath}
            previewLink={previewLink}
            titleMultiloc={titleMultiloc}
            onSave={handleSave}
            isSaving={isAddingLayout}
            saveHasError={isAddLayoutError}
          />
          <Box
            mt={`${stylingConsts.menuHeight}px`}
            display={previewEnabled ? 'none' : 'flex'}
            id="e2e-project-description-content-builder-page"
          >
            <FolderDescriptionBuilderToolbox
              selectedLocale={selectedLocale}
              folderId={contentBuildableId}
            />
            <DescriptionBuilderContent
              selectedLocale={selectedLocale}
              platformLocale={locale}
              editorData={editorData}
            />
            <ContentBuilderSettings />
          </Box>
        </Editor>
        <Box justifyContent="center" display={previewEnabled ? 'flex' : 'none'}>
          <DescriptionBuilderEditModePreview
            contentBuildableId={contentBuildableId}
            ref={iframeRef}
            selectedLocale={selectedLocale}
          />
        </Box>
      </FullscreenContentBuilder>
    </ContentBuilderLayoutProvider>
  );
};

export default DescriptionBuilderPage;
