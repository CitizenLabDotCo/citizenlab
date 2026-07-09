import React, { useState, useRef, useCallback } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { isEmpty } from 'lodash-es';
import { Multiloc, SupportedLocale } from 'typings';

import { ContentBuildableType } from 'api/content_builder/types';
import useAddContentBuilderLayout from 'api/content_builder/useAddContentBuilderLayout';
import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';
import useUpsertProjectPageLayout from 'api/project_page_layout/useUpsertProjectPageLayout';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import DescriptionBuilderContent from 'components/DescriptionBuilder/DescriptionBuilderContent';
import DescriptionBuilderEditModePreview from 'components/DescriptionBuilder/DescriptionBuilderEditModePreview';
import DescriptionBuilderToolbox from 'components/DescriptionBuilder/DescriptionBuilderToolbox';
import DescriptionBuilderTopBar from 'components/DescriptionBuilder/DescriptionBuilderTopBar';
import Editor from 'components/DescriptionBuilder/Editor';
import ContentBuilderSettings from 'components/DescriptionBuilder/Settings';
import useProjectDescription from 'components/DescriptionBuilder/useProjectDescription';
import { normalizeProjectPageLayout } from 'components/ProjectPageBuilder/defaultLayout';
import { spliceDescriptionEditorData } from 'components/ProjectPageBuilder/descriptionSection';

import { type TypedLinkProps } from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
import { useLocation } from 'utils/router';

type Props = {
  contentBuildableId: string;
  contentBuildableType: ContentBuildableType;
  backPath: string;
  previewLink: TypedLinkProps;
  titleMultiloc: Multiloc;
};

const DescriptionBuilderPage = ({
  contentBuildableId,
  contentBuildableType,
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

  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const locales = useAppConfigurationLocales();

  const isProject = contentBuildableType === 'project';

  // A project's description lives in the project_page layout's description
  // section; the editor edits that subtree and splices it back on save. Folders
  // (and unmigrated projects) still edit their legacy description layout.
  const {
    pageLayout,
    projectPageJson,
    descriptionEditorData,
    legacyLayout,
    refetchPageLayout,
  } = useProjectDescription(contentBuildableId, { enabled: isProject });
  const { data: folderLayout } = useContentBuilderLayout(
    contentBuildableType,
    contentBuildableId,
    !isProject
  );
  const layout = isProject ? pageLayout ?? legacyLayout : folderLayout;

  const {
    mutate: upsertProjectPageLayout,
    isLoading: isUpsertingProjectPage,
    isError: isUpsertProjectPageError,
  } = useUpsertProjectPageLayout();
  const {
    mutate: addContentBuilderLayout,
    isLoading: isAddingLayout,
    isError: isAddLayoutError,
  } = useAddContentBuilderLayout();

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

  if (isNilOrError(locales) || !descriptionBuilderVisible || !layout) {
    return null;
  }

  const hasError =
    Object.values(contentBuilderErrors).filter((node) => node.hasError).length >
    0;

  const getEditorData = () => {
    if (isProject && pageLayout) {
      return descriptionEditorData;
    }
    if (!isEmpty(layout.data.attributes.craftjs_json)) {
      return layout.data.attributes.craftjs_json;
    }
    return undefined;
  };

  // Always enable the layout on save: descriptions are edited exclusively in
  // the Content Builder, so saving a description makes it the live one.
  const handleSave = async (nodes: SerializedNodes) => {
    if (isProject && projectPageJson) {
      const { data: freshLayout } = await refetchPageLayout();
      const baseJson = freshLayout
        ? normalizeProjectPageLayout(freshLayout.data.attributes.craftjs_json)
        : projectPageJson;

      upsertProjectPageLayout({
        projectId: contentBuildableId,
        craftjs_json: spliceDescriptionEditorData(baseJson, nodes),
        enabled: true,
      });
    } else {
      addContentBuilderLayout({
        contentBuildableId,
        contentBuildableType,
        enabled: true,
        craftjs_json: nodes,
      });
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
            contentBuildableType={contentBuildableType}
            backPath={backPath}
            previewLink={previewLink}
            titleMultiloc={titleMultiloc}
            onSave={handleSave}
            isSaving={isUpsertingProjectPage || isAddingLayout}
            saveHasError={isUpsertProjectPageError || isAddLayoutError}
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
            <DescriptionBuilderContent
              selectedLocale={selectedLocale}
              platformLocale={locale}
              editorData={getEditorData()}
            />
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
