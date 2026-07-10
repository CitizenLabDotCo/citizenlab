import React from 'react';

import {
  Box,
  Spinner,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { Multiloc } from 'typings';

import useProjectFiles from 'api/project_files/useProjectFiles';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import ProjectInfo from 'containers/ProjectsShowPage/shared/header/ProjectInfo';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import { ContentBuilderLayoutProvider } from 'components/admin/ContentBuilder/context/ContentBuilderLayoutContext';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import Editor from 'components/DescriptionBuilder/Editor';
import useProjectDescription from 'components/DescriptionBuilder/useProjectDescription';
import FileAttachments from 'components/UI/FileAttachments';

import eventEmitter from 'utils/eventEmitter';

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
  const { data: projectFiles } = useProjectFiles(projectId);

  const { isLoading, pageLayout, descriptionEditorData, legacyLayout } =
    useProjectDescription(projectId, {
      enabled: featureEnabled,
      legacyEnabled: enabled,
    });

  if (!featureEnabled) return null;

  const legacyEditorData =
    enabled &&
    legacyLayout?.data.attributes.enabled &&
    !isEmpty(legacyLayout.data.attributes.craftjs_json)
      ? legacyLayout.data.attributes.craftjs_json
      : undefined;

  const editorData = pageLayout?.data.attributes.enabled
    ? descriptionEditorData
    : legacyEditorData;
  const layoutId = pageLayout?.data.id ?? legacyLayout?.data.id;

  return (
    <Box data-testid="descriptionBuilderPreview">
      {isLoading && <Spinner />}
      {!isLoading && editorData && (
        <Box data-testid="descriptionBuilderProjectPreviewContent">
          <Title color="tenantText" variant="h1">
            {localize(projectTitle)}
          </Title>
          <Box
            id={`project-description-${projectId}`}
            mx={isSmallerThanTablet ? '-20px' : '0px'}
          >
            <ContentBuilderLayoutProvider layoutId={layoutId}>
              <Editor isPreview={true}>
                <ContentBuilderFrame
                  editorData={editorData}
                  onLoadImages={handleLoadImages}
                />
              </Editor>
            </ContentBuilderLayoutProvider>
          </Box>

          {projectFiles && (
            <Box maxWidth="750px" mb="25px">
              <FileAttachments files={projectFiles.data} />
            </Box>
          )}
        </Box>
      )}
      {!isLoading && !editorData && (
        <Box data-testid="descriptionBuilderProjectDescription">
          <ProjectInfo projectId={projectId} />
        </Box>
      )}
    </Box>
  );
};

export default ProjectContentViewer;
