import React from 'react';

import { Box, Spinner, Title } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { Multiloc } from 'typings';

import useContentBuilderLayout from 'api/content_builder/useContentBuilderLayout';

import useLocalize from 'hooks/useLocalize';

import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';
import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import Editor from 'components/DescriptionBuilder/Editor';

import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

type FolderContentViewerProps = {
  folderId: string;
  folderTitle: Multiloc;
};

const handleLoadImages = () => {
  eventEmitter.emit(IMAGES_LOADED_EVENT);
};

const FolderContentViewer = ({
  folderId,
  folderTitle,
}: FolderContentViewerProps) => {
  const localize = useLocalize();
  const { data: descriptionBuilderLayout, isInitialLoading } =
    useContentBuilderLayout(folderId, 'folder');

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
    </Box>
  );
};

export default FolderContentViewer;
