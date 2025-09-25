import React from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';

import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';
import useProjectFiles from 'api/project_files/useProjectFiles';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import ProjectInfo from 'containers/ProjectsShowPage/shared/header/ProjectInfo';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import Editor from 'components/DescriptionBuilder/Editor';
import FileAttachments from 'components/UI/FileAttachments';

import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

type ProjectContentViewerProps = {
  project: IProjectData;
};

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

const ProjectContentViewer = ({ project }: ProjectContentViewerProps) => {
  const localize = useLocalize();
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const { data: projectFiles } = useProjectFiles(project.id);
  const { data: descriptionBuilderLayout, isInitialLoading } =
    useContentBuilderLayout(
      project.id,
      'project',
      featureEnabled && project.attributes.uses_content_builder
    );

  if (!featureEnabled) return null;

  const descriptionBuilderContent =
    descriptionBuilderLayout &&
    project.attributes.uses_content_builder &&
    descriptionBuilderLayout.data.attributes.enabled &&
    !isEmpty(descriptionBuilderLayout.data.attributes.craftjs_json);

  const editorData = !isNilOrError(descriptionBuilderLayout)
    ? descriptionBuilderLayout.data.attributes.craftjs_json
    : undefined;

  return (
    <Box data-testid="descriptionBuilderPreview">
      {isInitialLoading && <Spinner />}
      {!isInitialLoading && descriptionBuilderContent && (
        <Box data-testid="descriptionBuilderPreviewContent">
          <Title color="tenantText" variant="h1">
            {localize(project.attributes.title_multiloc)}
          </Title>
          <Box id={`project-description-${project.id}`}>
            <Editor isPreview={true}>
              <ContentBuilderFrame
                editorData={editorData}
                onLoadImages={handleLoadImages}
              />
            </Editor>
          </Box>

          {projectFiles && (
            <Box maxWidth="750px" mb="25px">
              <FileAttachments files={projectFiles.data} />
            </Box>
          )}
        </Box>
      )}
      {!isInitialLoading && !descriptionBuilderContent && (
        <Box data-testid="descriptionBuilderProjectDescription">
          <ProjectInfo projectId={project.id} />
        </Box>
      )}
    </Box>
  );
};

export default ProjectContentViewer;
