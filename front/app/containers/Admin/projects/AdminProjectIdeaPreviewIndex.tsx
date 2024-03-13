import React from 'react';

import { useParams } from 'react-router-dom';

import IdeaPreviewIndex from 'components/admin/PostManager/components/IdeaPreviewIndex';

const AdminProjectIdeaPreviewIndex = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    // We don't have phaseId where this component is rendered
    phaseId: string;
  };
  return (
    <IdeaPreviewIndex
      // Broken link
      goBackUrl={`/admin/projects/${projectId}/ideas/${phaseId}`}
    />
  );
};

export default AdminProjectIdeaPreviewIndex;
