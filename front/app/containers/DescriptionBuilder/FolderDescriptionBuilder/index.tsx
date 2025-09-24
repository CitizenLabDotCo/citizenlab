import React from 'react';

import { useParams } from 'react-router-dom';

import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import DescriptionBuilderPage from 'containers/DescriptionBuilder/index';

import { isNilOrError } from 'utils/helperUtils';

const FolderDescriptionBuilderPage = () => {
  const { folderId } = useParams() as { folderId: string };
  const { data: folder } = useProjectFolderById(folderId);

  if (isNilOrError(folder)) return null;

  return (
    <DescriptionBuilderPage
      modelId={folderId}
      modelType="folder"
      backPath={`/admin/projects/folders/${folderId}/settings`}
      previewPath={`/folders/${folder.data.attributes.slug}`}
      titleMultiloc={folder.data.attributes.title_multiloc}
    />
  );
};

export default FolderDescriptionBuilderPage;
