import React from 'react';

import {
  Box,
  Spinner,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { Multiloc } from 'typings';

import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';
import useProjectFiles from 'api/project_files/useProjectFiles';
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import ProjectInfo from 'containers/ProjectsShowPage/shared/header/ProjectInfo';
import ProjectPages from 'containers/ProjectsShowPage/shared/header/ProjectPages';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import Editor from 'components/DescriptionBuilder/Editor';
import FileAttachments from 'components/UI/FileAttachments';

import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

type ProjectContentViewerProps = {
  projectId: string;
  projectTitle: Multiloc;
  enabled: boolean;
};

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

const ProjectContentViewer = ({
  projectId,
  projectTitle,
  enabled,
}: ProjectContentViewerProps) => {
  const localize = useLocalize();
  const isSmallerThanTablet = useBreakpoint('tablet');
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const { data: project } = useProjectById(projectId);
  const { data: projectFiles } = useProjectFiles(projectId);
  const { data: descriptionBuilderLayout, isInitialLoading } =
    useContentBuilderLayout('project', projectId, featureEnabled && enabled);

  if (!featureEnabled) return null;

  const descriptionBuilderContent =
    enabled &&
    descriptionBuilderLayout &&
    descriptionBuilderLayout.data.attributes.enabled &&
    !isEmpty(descriptionBuilderLayout.data.attributes.craftjs_json);

  const editorData = !isNilOrError(descriptionBuilderLayout)
    ? descriptionBuilderLayout.data.attributes.craftjs_json
    : undefined;

  return (
    <Box data-testid="descriptionBuilderPreview">
      {isInitialLoading && <Spinner />}
      {!isInitialLoading && descriptionBuilderContent && (
        <Box data-testid="descriptionBuilderProjectPreviewContent">
          <Title color="tenantText" variant="h1">
            {localize(projectTitle)}
          </Title>
          <Box
            id={`project-description-${projectId}`}
            mx={isSmallerThanTablet ? '-20px' : '0px'}
          >
            <ContentBuilderLayoutProvider
              layoutId={descriptionBuilderLayout.data.id}
            >
              <Editor isPreview={true}>
                <ContentBuilderFrame
                  editorData={editorData}
                  onLoadImages={handleLoadImages}
                />
              </Editor>
            </ContentBuilderLayoutProvider>
          </Box>

          {project && (
            <Box maxWidth="750px" mb="25px">
              <ProjectPages
                projectId={projectId}
                projectSlug={project.data.attributes.slug}
              />
            </Box>
          )}

          {projectFiles && (
            <Box maxWidth="750px" mb="25px">
              <FileAttachments files={projectFiles.data} />
            </Box>
          )}
        </Box>
      )}
      {!isInitialLoading && !descriptionBuilderContent && (
        <Box data-testid="descriptionBuilderProjectDescription">
          <ProjectInfo projectId={projectId} />
        </Box>
      )}
    </Box>
  );
};

export default ProjectContentViewer;
