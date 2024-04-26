import React from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import useProjectDescriptionBuilderLayout from 'modules/commercial/project_description_builder/api/useProjectDescriptionBuilderLayout';
import { Multiloc } from 'typings';

import useProjectFiles from 'api/project_files/useProjectFiles';

import useLocalize from 'hooks/useLocalize';

import ProjectInfo from 'containers/ProjectsShowPage/shared/header/ProjectInfo';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import FileAttachments from 'components/UI/FileAttachments';

import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

import Editor from '../../Editor';

type PreviewProps = {
  projectId: string;
  projectTitle: Multiloc;
  usesContentBuilder?: boolean;
};

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

const Preview = ({
  projectId,
  projectTitle,
  usesContentBuilder,
}: PreviewProps) => {
  const localize = useLocalize();
  const { data: projectFiles } = useProjectFiles(projectId);

  const { data: projectDescriptionBuilderLayout, isInitialLoading } =
    useProjectDescriptionBuilderLayout(projectId);

  const projectDescriptionBuilderContent =
    projectDescriptionBuilderLayout &&
    projectDescriptionBuilderLayout.data.attributes.enabled &&
    !isEmpty(projectDescriptionBuilderLayout.data.attributes.craftjs_json);

  const editorData = !isNilOrError(projectDescriptionBuilderLayout)
    ? projectDescriptionBuilderLayout.data.attributes.craftjs_json
    : undefined;

  return (
    <Box data-testid="projectDescriptionBuilderPreview">
      {isInitialLoading && <Spinner />}
      {!isInitialLoading &&
        projectDescriptionBuilderContent &&
        usesContentBuilder && (
          <Box data-testid="projectDescriptionBuilderPreviewContent">
            <Title color="tenantText" variant="h1">
              {localize(projectTitle)}
            </Title>
            <Editor isPreview={true}>
              <ContentBuilderFrame
                editorData={editorData}
                onLoadImages={handleLoadImages}
              />
            </Editor>
            {projectFiles && (
              <Box maxWidth="750px" mb="25px">
                <FileAttachments files={projectFiles.data} />
              </Box>
            )}
          </Box>
        )}
      {!isInitialLoading &&
        (!usesContentBuilder || !projectDescriptionBuilderContent) && (
          <Box data-testid="projectDescriptionBuilderProjectDescription">
            <ProjectInfo projectId={projectId} />
          </Box>
        )}
    </Box>
  );
};

export default Preview;
