import React from 'react';

import { IProjectData } from 'api/projects/types';

import useReviewAction from 'containers/Admin/projects/_shared/useReviewAction';

import ApproveButton from './ApproveButton';
import RequestApprovalDropdown from './RequestApprovalDropdown';

interface Props {
  project: IProjectData;
  opened: boolean;
  onOpenChange: (opened: boolean) => void;
}

const ReviewFlow = ({ project, opened, onOpenChange }: Props) => {
  const { action, pending, isLoading } = useReviewAction(project);

  if (action === 'approve') return <ApproveButton projectId={project.id} />;
  if (action !== 'request') return null;

  return (
    <RequestApprovalDropdown
      projectId={project.id}
      inFolder={!!project.attributes.folder_id}
      pending={pending}
      processing={isLoading}
      opened={opened}
      onOpenChange={onOpenChange}
    />
  );
};

export default ReviewFlow;
