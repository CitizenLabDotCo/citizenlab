import React from 'react';

import { useParams } from 'utils/router';

import IdeaPreviewIndex from 'components/admin/PostManager/components/IdeaPreviewIndex';

const AdminProjectIdeaPreviewIndex = () => {
  const { projectId, phaseId } = useParams({ strict: false }) as {
    projectId: string;
    phaseId: string;
  };
  return (
    <IdeaPreviewIndex
      goBackUrl={`/admin/projects/${projectId}/ideas/${phaseId}`}
    />
  );
};

export default AdminProjectIdeaPreviewIndex;
