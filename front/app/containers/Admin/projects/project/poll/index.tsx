import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useProject from 'hooks/useProject';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { useParams } from 'react-router-dom';
import AdminContinuousProjectPoll from './AdminContinuousProjectPoll';
import AdminTimelineProjectPoll from './AdminTimelineProjectPoll';

const AdminProjectPoll = () => {
  const { projectId } = useParams() as { projectId: string };
  const project = useProject({ projectId });
  const isEnabled = useFeatureFlag({ name: 'polls' });

  if (isNilOrError(project) || !isEnabled) return null;

  if (
    project.attributes.process_type === 'continuous' &&
    project.attributes.participation_method === 'poll'
  ) {
    return <AdminContinuousProjectPoll />;
  }

  if (project.attributes.process_type === 'timeline') {
    return <AdminTimelineProjectPoll />;
  }
  return null;
};

export default AdminProjectPoll;
