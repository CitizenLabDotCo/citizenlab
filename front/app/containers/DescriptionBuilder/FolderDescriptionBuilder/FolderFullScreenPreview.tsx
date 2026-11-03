import React from 'react';

import FullScreenPreview from 'containers/DescriptionBuilder/FullScreenPreview';

import { useParams } from 'utils/router';

export const FolderFullScreenPreview = () => {
  const { folderId } = useParams({ strict: false }) as { folderId: string };

  return <FullScreenPreview contentBuildableId={folderId} />;
};

export default FolderFullScreenPreview;
