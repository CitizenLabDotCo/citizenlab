import React, { useState, useRef, useCallback, useMemo } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { Multiloc, SupportedLocale } from 'typings';

import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';
import useParallelParticipation from 'hooks/useParallelParticipation';

import ContentBuilderCanvas from 'components/admin/ContentBuilder/Canvas';
import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import LanguageProvider from 'components/admin/ContentBuilder/LanguageProvider';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import ContentBuilderSettings from 'components/DescriptionBuilder/Settings';
import { normalizeProjectPageLayout } from 'components/ProjectPageBuilder/defaultLayout';
import ProjectPageBuilderEditModePreview from 'components/ProjectPageBuilder/EditModePreview';
import Editor from 'components/ProjectPageBuilder/Editor';
import ProjectPageBuilderToolbox from 'components/ProjectPageBuilder/Toolbox';
import ProjectPageBuilderTopBar from 'components/ProjectPageBuilder/TopBar';

import { type TypedLinkProps } from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
import { useLocation } from 'utils/router';

type Props = {
  projectId: string;
  backPath: string;
  previewLink: TypedLinkProps;
  titleMultiloc: Multiloc;
};

const ProjectPageBuilderPage = ({
  projectId,
  backPath,
  previewLink,
  titleMultiloc,
}: Props) => {
  const locale = useLocale();
  const parallelParticipation = useParallelParticipation();
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const { pathname } = useLocation();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const locales = useAppConfigurationLocales();
  const { data: layout } = useProjectPageLayout(projectId);

  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});
  const [imageUploading, setImageUploading] = useState(false);

  // Memoised so the frame doesn't re-deserialize on every render.
  const editorData = useMemo(
    () => normalizeProjectPageLayout(layout?.data.attributes.craftjs_json),
    [layout]
  );

  const builderVisible =
    parallelParticipation && pathname.includes('admin/project-page-builder');

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

  if (isNilOrError(locales) || !builderVisible || !layout) {
    return null;
  }

  const hasError =
    Object.values(contentBuilderErrors).filter((node) => node.hasError).length >
    0;

  const handleEditorChange = (nodes: SerializedNodes) => {
    iframeRef.current?.contentWindow?.postMessage(nodes, window.location.href);
  };

  const handleSelectedLocaleChange = (newLocale: SupportedLocale) => {
    iframeRef.current?.contentWindow?.postMessage(
      { selectedLocale: newLocale },
      window.location.href
    );

    setSelectedLocale(newLocale);
  };

  return (
    <ContentBuilderLayoutProvider layoutId={layout.data.id}>
      <FullscreenContentBuilder
        onErrors={handleErrors}
        onDeleteElement={handleDeleteElement}
        onUploadImage={setImageUploading}
      >
        <Editor isPreview={false} onNodesChange={handleEditorChange}>
          <ProjectPageBuilderTopBar
            hasError={hasError}
            hasPendingState={imageUploading}
            previewEnabled={previewEnabled}
            setPreviewEnabled={setPreviewEnabled}
            selectedLocale={selectedLocale}
            onSelectLocale={handleSelectedLocaleChange}
            projectId={projectId}
            backPath={backPath}
            previewLink={previewLink}
            titleMultiloc={titleMultiloc}
          />
          <Box
            mt={`${stylingConsts.menuHeight}px`}
            display={previewEnabled ? 'none' : 'flex'}
            id="e2e-project-page-content-builder-page"
          >
            <ProjectPageBuilderToolbox />
            <LanguageProvider
              contentBuilderLocale={selectedLocale}
              platformLocale={locale}
            >
              <ContentBuilderCanvas>
                <Box width="100%" maxWidth="1000px">
                  <ContentBuilderFrame editorData={editorData} />
                </Box>
              </ContentBuilderCanvas>
            </LanguageProvider>
            <ContentBuilderSettings />
          </Box>
        </Editor>
        <Box justifyContent="center" display={previewEnabled ? 'flex' : 'none'}>
          <ProjectPageBuilderEditModePreview
            projectId={projectId}
            ref={iframeRef}
            selectedLocale={selectedLocale}
          />
        </Box>
      </FullscreenContentBuilder>
    </ContentBuilderLayoutProvider>
  );
};

export default ProjectPageBuilderPage;
