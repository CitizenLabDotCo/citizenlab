import React from 'react';

import useProjectFolderById from 'api/project_folders/useProjectFolderById';

import DescriptionBuilderPage from 'containers/DescriptionBuilder/index';

import { useParams } from 'utils/router';

const FolderDescriptionBuilderPage = () => {
  const { folderId } = useParams({ strict: false }) as { folderId: string };
  const { data: folder } = useProjectFolderById(folderId);

  if (!folder) return null;
  if (!folder.data.attributes.uses_content_builder) return null;

  return (
    <DescriptionBuilderPage
      contentBuildableId={folderId}
      contentBuildableType="folder"
      backPath={`/admin/projects/folders/${folderId}/settings`}
      previewLink={{
        to: '/folders/$slug',
        params: { slug: folder.data.attributes.slug },
      }}
      titleMultiloc={folder.data.attributes.title_multiloc}
    />
  );
};

export default FolderDescriptionBuilderPage;
