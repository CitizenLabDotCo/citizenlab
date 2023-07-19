import IdeaPreviewIndex from 'components/admin/PostManager/components/IdeaPreviewIndex';
import React from 'react';
import { useParams } from 'react-router-dom';

const AdminProjectIdeaPreviewIndex = () => {
  const { projectId } = useParams() as {
    projectId: string;
  };
  return <IdeaPreviewIndex goBackUrl={`/admin/projects/${projectId}/ideas`} />;
};

export default AdminProjectIdeaPreviewIndex;
