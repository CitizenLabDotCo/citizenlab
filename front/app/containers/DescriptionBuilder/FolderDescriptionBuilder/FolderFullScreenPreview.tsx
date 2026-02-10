import React from 'react';

import { useParams } from 'utils/router';

import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import FullScreenPreview from 'containers/DescriptionBuilder/FullScreenPreview';

export const FolderFullScreenPreview = () => {
  const { folderId } = useParams({ strict: false }) as { folderId: string };
  const { data: folder } = useProjectFolderById(folderId);

  if (!folder) return null;
  if (!folder.data.attributes.uses_content_builder) return null;

  return (
    <FullScreenPreview
      contentBuildableId={folderId}
      contentBuildableType="folder"
      titleMultiloc={folder.data.attributes.title_multiloc}
    />
  );
};

export default FolderFullScreenPreview;
