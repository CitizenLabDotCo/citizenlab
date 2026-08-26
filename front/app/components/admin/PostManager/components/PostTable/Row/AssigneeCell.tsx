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

// Keep this at module scope. A cell component built inside IdeaRow's render is
// a new component type on every render, so React drops the cell and mounts it
// again — taking the open assignee dropdown with it.
const AssigneeCell = ({ idea, onChange }: Props) => (
  <AssigneeSelect
    onAssigneeChange={onChange(idea)}
    projectId={idea.relationships.project.data.id}
    assigneeId={idea.relationships.assignee?.data?.id}
  />
);

export default AssigneeCell;
