import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

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
import useProjectDescriptionBuilderLayout from '../../hooks/useProjectDescriptionBuilderLayout';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { SerializedNodes } from '@craftjs/core';
import { Locale } from 'typings';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';

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
  const projectDescriptionBuilderLayout =
    useProjectDescriptionBuilderLayout(projectId);

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
    if (!isNilOrError(projectDescriptionBuilderLayout) && selectedLocale) {
      if (draftData && draftData[selectedLocale]) {
        return draftData[selectedLocale];
      } else {
        return projectDescriptionBuilderLayout.data.attributes
          .craftjs_jsonmultiloc[selectedLocale];
      }
    } else return undefined;
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
        <ProjectDescriptionBuilderTopBar
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
          {selectedLocale && (
            <ProjectDescriptionBuilderToolbox selectedLocale={selectedLocale} />
          )}
          <StyledRightColumn>
            <Box width="1000px">
              <ErrorMessage localesWithError={localesWithError} />
              <ContentBuilderFrame editorData={getEditorData()} />
            </Box>
          </StyledRightColumn>
          <ContentBuilderSettings />
        </Box>
      </Editor>
      <Box justifyContent="center" display={previewEnabled ? 'flex' : 'none'}>
        <ProjectDescriptionBuilderEditModePreview
          projectId={projectId}
          ref={iframeRef}
        />
      </Box>
    </FullscreenContentBuilder>
  );
};

export default ProjectDescriptionBuilderPage;
