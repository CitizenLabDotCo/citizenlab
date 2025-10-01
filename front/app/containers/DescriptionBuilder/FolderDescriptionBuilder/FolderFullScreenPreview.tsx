import React from 'react';

import { useParams } from 'react-router-dom';

import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import FullScreenPreview from 'containers/DescriptionBuilder/FullScreenPreview';

export const FolderFullScreenPreview = () => {
  const { folderId } = useParams() as { folderId: string };
  const { data: folder } = useProjectFolderById(folderId);

  if (!folder) return null;
  if (!folder.data.attributes.uses_content_builder) return null;

  return (
    <FullScreenPreview
      modelId={folderId}
      modelType="folder"
      titleMultiloc={folder.data.attributes.title_multiloc}
    />
  );
};

export default FolderFullScreenPreview;
