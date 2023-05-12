import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { useParams } from 'react-router-dom';
import AdminContinuousProjectPoll from './AdminContinuousProjectPoll';
import AdminTimelineProjectPoll from './AdminTimelineProjectPoll';
import useProjectById from 'api/projects/useProjectById';

const AdminProjectPoll = () => {
  const { projectId } = useParams() as { projectId: string };
  const { data: project } = useProjectById(projectId);
  const isEnabled = useFeatureFlag({ name: 'polls' });

  if (isNilOrError(project) || !isEnabled) return null;

  if (
    project.data.attributes.process_type === 'continuous' &&
    project.data.attributes.participation_method === 'poll'
  ) {
    return <AdminContinuousProjectPoll project={project} />;
  }

  if (project.data.attributes.process_type === 'timeline') {
    return <AdminTimelineProjectPoll projectId={projectId} />;
  }
  return null;
};

export default AdminProjectPoll;
