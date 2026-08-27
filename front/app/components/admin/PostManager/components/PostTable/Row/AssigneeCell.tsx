import React from 'react';

import { Override } from 'typings';

import { IIdeaData } from 'api/ideas/types';

import AssigneeSelect from 'components/admin/PostManager/components/PostTable/AssigneeSelect';

import { IdeaCellComponentProps } from './IdeaRow';

type Props = Override<
  IdeaCellComponentProps,
  {
    onChange: (idea: IIdeaData) => (assigneeId?: string) => void;
  }
>;

const AssigneeCell = ({ idea, onChange }: Props) => (
  <AssigneeSelect
    onAssigneeChange={onChange(idea)}
    projectId={idea.relationships.project.data.id}
    assigneeId={idea.relationships.assignee?.data?.id}
  />
);

export default AssigneeCell;
