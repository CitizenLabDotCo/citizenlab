import React from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { Multiloc } from 'typings';

import useProjectDescriptionBuilderLayout from 'api/project_description_builder/useProjectDescriptionBuilderLayout';

import useLocalize from 'hooks/useLocalize';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

import Editor from '../../Editor';
import FileAttachments from 'components/UI/FileAttachments';
import useProjectFolderFiles from 'api/project_folder_files/useProjectFolderFiles';
import ProjectFolderDescription from 'containers/ProjectFolderShowPage/ProjectFolderDescription';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';

type PreviewProps = {
  folderId: string;
  folderTitle: Multiloc;
};

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

const FolderViewer = ({ folderId, folderTitle }: PreviewProps) => {
  const localize = useLocalize();
  const { data: folder } = useProjectFolderById(folderId);
  const { data: projectDescriptionBuilderLayout, isInitialLoading } =
    useProjectDescriptionBuilderLayout(folderId, 'folder');
  const { data: projectFolderFiles } = useProjectFolderFiles({
    projectFolderId: folderId,
  });

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
      {!isInitialLoading && projectDescriptionBuilderContent && (
        <Box data-testid="projectDescriptionBuilderPreviewContent">
          <Title color="tenantText" variant="h1">
            {localize(folderTitle)}
          </Title>
          <Box id={`project-folder-description-${folderId}`} mb="24px">
            <Editor isPreview={true}>
              <ContentBuilderFrame
                editorData={editorData}
                onLoadImages={handleLoadImages}
              />
            </Editor>
          </Box>

          {projectFolderFiles && projectFolderFiles.data.length > 0 && (
            <Box mb="24px">
              <FileAttachments files={projectFolderFiles.data} />
            </Box>
          )}
        </Box>
      )}
      {!isInitialLoading && !projectDescriptionBuilderContent && folder && (
        <Box data-testid="projectDescriptionBuilderProjectDescription">
          <ProjectFolderDescription projectFolder={folder.data} />
        </Box>
      )}
    </Box>
  );
};

export default FolderViewer;
