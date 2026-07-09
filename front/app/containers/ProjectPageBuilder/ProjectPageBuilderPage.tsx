import React, { useState, useRef, useCallback, useMemo } from 'react';

import { Box, stylingConsts } from '@citizenlab/cl2-component-library';
import { SerializedNodes } from '@craftjs/core';
import { Multiloc, SupportedLocale } from 'typings';

import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';
import useUpsertProjectPageLayout from 'api/project_page_layout/useUpsertProjectPageLayout';
import { IUpdatedProjectProperties } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';
import useParallelParticipation from 'hooks/useParallelParticipation';

import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import FullscreenContentBuilder from 'components/admin/ContentBuilder/FullscreenContentBuilder';
import { ContentBuilderErrors } from 'components/admin/ContentBuilder/typings';
import DescriptionBuilderContent from 'components/DescriptionBuilder/DescriptionBuilderContent';
import ContentBuilderSettings from 'components/DescriptionBuilder/Settings';
import { normalizeProjectPageLayout } from 'components/ProjectPageBuilder/defaultLayout';
import ProjectPageBuilderEditModePreview from 'components/ProjectPageBuilder/EditModePreview';
import Editor from 'components/ProjectPageBuilder/Editor';
import {
  extractProjectAttributeDrafts,
  hasProjectAttributeDrafts,
  stripProjectAttributeDrafts,
} from 'components/ProjectPageBuilder/projectAttributeDrafts';
import ProjectPageBuilderToolbox from 'components/ProjectPageBuilder/Toolbox';
import ProjectPageBuilderTopBar from 'components/ProjectPageBuilder/TopBar';

import { type TypedLinkProps } from 'utils/cl-router/Link';
import { convertUrlToUploadFile } from 'utils/fileUtils';
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
  const { mutateAsync: upsertProjectPageLayout } = useUpsertProjectPageLayout();
  const { mutateAsync: updateProject } = useUpdateProject();

  const [contentBuilderErrors, setContentBuilderErrors] =
    useState<ContentBuilderErrors>({});
  const [imageUploading, setImageUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

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

  // Two-step save: commit the widgets' project-attribute drafts to the project,
  // then persist the layout with the drafts stripped (see projectAttributeDrafts.ts).
  const handleSave = async (nodes: SerializedNodes): Promise<boolean> => {
    if (isSaving) return false;
    setIsSaving(true);
    setSaveError(false);

    try {
      const drafts = extractProjectAttributeDrafts(nodes);

      if (hasProjectAttributeDrafts(drafts)) {
        const attributes: IUpdatedProjectProperties = { projectId };
        if (drafts.titleMultiloc) {
          attributes.title_multiloc = drafts.titleMultiloc;
        }
        if (drafts.bannerImageUrl) {
          const file = await convertUrlToUploadFile(drafts.bannerImageUrl);
          if (!file?.base64) {
            throw new Error('Could not read the uploaded project image');
          }
          attributes.header_bg = file.base64;
        } else if (drafts.bannerRemoved) {
          attributes.header_bg = null;
        }
        if (drafts.bannerAltMultiloc) {
          attributes.header_bg_alt_text_multiloc = drafts.bannerAltMultiloc;
        }
        await updateProject(attributes);
      }

      await upsertProjectPageLayout({
        projectId,
        craftjs_json: stripProjectAttributeDrafts(nodes),
      });

      return true;
    } catch {
      setSaveError(true);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

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
            backPath={backPath}
            previewLink={previewLink}
            titleMultiloc={titleMultiloc}
            onSave={handleSave}
            isSaving={isSaving}
            saveHasError={saveError}
          />
          <Box
            mt={`${stylingConsts.menuHeight}px`}
            display={previewEnabled ? 'none' : 'flex'}
            id="e2e-project-page-content-builder-page"
          >
            <ProjectPageBuilderToolbox />
            <DescriptionBuilderContent
              selectedLocale={selectedLocale}
              platformLocale={locale}
              editorData={editorData}
            />
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
