import React from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';

import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';
import { IProjectFolderData } from 'api/project_folders/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import ProjectFolderDescription from 'containers/ProjectFolderShowPage/ProjectFolderDescription';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import Editor from 'components/DescriptionBuilder/Editor';

import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

type FolderContentViewerProps = {
  folder: IProjectFolderData;
};

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

const FolderContentViewer = ({ folder }: FolderContentViewerProps) => {
  const localize = useLocalize();
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const { data: descriptionBuilderLayout, isInitialLoading } =
    useContentBuilderLayout(
      folder.id,
      'folder',
      featureEnabled && folder.attributes.uses_content_builder
    );

  if (!featureEnabled) return null;

  const descriptionBuilderContent =
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
        <Box data-testid="descriptionBuilderPreviewContent">
          <Title color="tenantText" variant="h1">
            {localize(folder.attributes.title_multiloc)}
          </Title>
          <Box id={`project-folder-description-${folder.id}`} mb="24px">
            <Editor isPreview={true}>
              <ContentBuilderFrame
                editorData={editorData}
                onLoadImages={handleLoadImages}
              />
            </Editor>
          </Box>
        </Box>
      )}
      {!isInitialLoading && !descriptionBuilderContent && (
        <Box data-testid="descriptionBuilderProjectDescription">
          <ProjectFolderDescription projectFolder={folder} />
        </Box>
      )}
    </Box>
  );
};

export default FolderContentViewer;
