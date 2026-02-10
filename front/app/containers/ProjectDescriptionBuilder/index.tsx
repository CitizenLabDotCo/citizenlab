import React, { useState, useRef, useCallback } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { isEmpty } from 'lodash-es';
import { SupportedLocale } from 'typings';

import useProjectDescriptionBuilderLayout from 'api/project_description_builder/useProjectDescriptionBuilderLayout';
import useProjectById from 'api/projects/useProjectById';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import { StyledRightColumn } from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import Editor from 'components/ProjectDescriptionBuilder/Editor';

import { isNilOrError } from 'utils/helperUtils';
import { useParams, useLocation } from 'utils/router';

import ProjectDescriptionBuilderEditModePreview from '../../components/ProjectDescriptionBuilder/ProjectDescriptionBuilderEditModePreview';
import ProjectDescriptionBuilderToolbox from '../../components/ProjectDescriptionBuilder/ProjectDescriptionBuilderToolbox';
import ProjectDescriptionBuilderTopBar from '../../components/ProjectDescriptionBuilder/ProjectDescriptionBuilderTopBar';
import ContentBuilderSettings from '../../components/ProjectDescriptionBuilder/Settings';

const ProjectDescriptionBuilderPage = () => {
  const locale = useLocale();
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [draftData, setDraftData] = useState<Record<string, SerializedNodes>>();
  const { pathname } = useLocation();
  const { projectId } = useParams({ strict: false }) as { projectId: string };

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const locales = useAppConfigurationLocales();
  const { data: projectDescriptionBuilderLayout } =
    useProjectDescriptionBuilderLayout(projectId);
  const { data: project } = useProjectById(projectId);

  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});

  const [imageUploading, setImageUploading] = useState(false);

  const projectDescriptionBuilderVisible =
    featureEnabled && pathname.includes('admin/project-description-builder');

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

  if (isNilOrError(locales) && projectDescriptionBuilderVisible) {
    return null;
  }

  const hasError =
    Object.values(contentBuilderErrors).filter((node) => node.hasError).length >
    0;

  const getEditorData = () => {
    if (
      projectDescriptionBuilderLayout &&
      !isEmpty(projectDescriptionBuilderLayout.data.attributes.craftjs_json)
    ) {
      return projectDescriptionBuilderLayout.data.attributes.craftjs_json;
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

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!project || (project && !project.data.attributes.uses_content_builder)) {
    return null;
  }

  return (
    <FullscreenContentBuilder
      onErrors={handleErrors}
      onDeleteElement={handleDeleteElement}
      onUploadImage={setImageUploading}
    >
      <Editor isPreview={false} onNodesChange={handleEditorChange}>
        <ProjectDescriptionBuilderTopBar
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
          id="e2e-project-description-content-builder-page"
        >
          <ProjectDescriptionBuilderToolbox />
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
        <ProjectDescriptionBuilderEditModePreview
          projectId={projectId}
          ref={iframeRef}
          selectedLocale={selectedLocale}
        />
      </Box>
    </FullscreenContentBuilder>
  );
};

export default ProjectDescriptionBuilderPage;
