import React from 'react';

import { useParams } from '@tanstack/react-router';

import IdeaPreviewIndex from 'components/admin/PostManager/components/IdeaPreviewIndex';

const AdminProjectIdeaPreviewIndex = () => {
  const { projectId, phaseId } = useParams() as {
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
