import React from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';

import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import ProjectFolderDescription from 'containers/ProjectFolderShowPage/ProjectFolderDescription';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import Editor from 'components/DescriptionBuilder/Editor';

import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';
import { Multiloc } from 'typings';

type FolderContentViewerProps = {
  folderId: string;
  folderTitle: Multiloc;
  enabled: boolean;
};

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

const FolderContentViewer = ({
  folderId,
  folderTitle,
  enabled,
}: FolderContentViewerProps) => {
  const localize = useLocalize();
  const featureEnabled = useFeatureFlag({
    name: 'project_description_builder',
  });
  const { data: descriptionBuilderLayout, isInitialLoading } =
    useContentBuilderLayout(folderId, 'folder', featureEnabled && enabled);

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
        </Box>
      )}
      {!isInitialLoading && !descriptionBuilderContent && (
        <Box data-testid="descriptionBuilderProjectDescription">
          <ProjectFolderDescription
            folderId={folderId}
            folderTitle={folderTitle}
            folderDescription={{}} // TODO: JS - this description is missing in the props + this repeats what happens in folder description
          />
        </Box>
      )}
    </Box>
  );
};

export default FolderContentViewer;
