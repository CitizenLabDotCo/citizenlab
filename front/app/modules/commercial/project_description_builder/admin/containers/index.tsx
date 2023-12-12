import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

// components
import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import ProjectDescriptionBuilderEditModePreview from '../components/ProjectDescriptionBuilderEditModePreview';

// craft
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import Editor from '../components/Editor';
import ProjectDescriptionBuilderToolbox from '../components/ProjectDescriptionBuilderToolbox';
import ProjectDescriptionBuilderTopBar from '../components/ProjectDescriptionBuilderTopBar';
import { StyledRightColumn } from 'components/admin/ContentBuilder/Frame/FrameWrapper';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import ContentBuilderSettings from 'components/admin/ContentBuilder/Settings';

// hooks
import useLocale from 'hooks/useLocale';
import useProjectDescriptionBuilderLayout from 'modules/commercial/project_description_builder/api/useProjectDescriptionBuilderLayout';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useProjectById from 'api/projects/useProjectById';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { SerializedNodes } from '@craftjs/core';
import { Locale } from 'typings';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import { isEmpty } from 'lodash-es';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';

const ProjectDescriptionBuilderPage = () => {
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState<Locale | undefined>();
  const [draftData, setDraftData] = useState<Record<string, SerializedNodes>>();
  const { pathname } = useLocation();
  const { projectId } = useParams() as { projectId: string };

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const locale = useLocale();
  const locales = useAppConfigurationLocales();
  const { data: projectDescriptionBuilderLayout } =
    useProjectDescriptionBuilderLayout(projectId);
  const { data: project } = useProjectById(projectId);

  useEffect(() => {
    if (!isNilOrError(locale)) {
      setSelectedLocale(locale);
    }
  }, [locale]);

  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});

  const [imageUploading, setImageUploading] = useState(false);

  const projectDescriptionBuilderVisible =
    featureEnabled && pathname.includes('admin/project-description-builder');

  if (isNilOrError(locales) && projectDescriptionBuilderVisible) {
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
  };

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
        >
          {selectedLocale && (
            <ProjectDescriptionBuilderToolbox selectedLocale={selectedLocale} />
          )}
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
