import React from 'react';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';
import { isNilOrError } from 'utils/helperUtils';
import DescriptionBuilderPage from 'containers/DescriptionBuilder/index';
import { useParams } from 'react-router-dom';

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
