import React from 'react';

import { IIdeaData } from 'api/ideas/types';
import useUpdateIdea from 'api/ideas/useUpdateIdea';

import tracks from 'components/admin/PostManager/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import OptionList from '../OptionList';
import useAssigneeOptions, { UNASSIGNED } from '../useAssigneeOptions';

import PropertyMenu from './PropertyMenu';
import PropertyRow from './PropertyRow';

interface Props {
  idea: IIdeaData;
}

const AssigneeProperty = ({ idea }: Props) => {
  const { formatMessage } = useIntl();
  const options = useAssigneeOptions(idea.relationships.project.data.id);
  const { mutate: updateIdea } = useUpdateIdea();
  const assigneeId = idea.relationships.assignee?.data?.id ?? UNASSIGNED;
  const current = options.find((option) => option.value === assigneeId);

  const assign = (newAssigneeId: string) => {
    updateIdea({
      id: idea.id,
      requestBody: {
        assignee_id: newAssigneeId === UNASSIGNED ? null : newAssigneeId,
      },
    });
    trackEventByName(tracks.changeIdeaAssignment, {
      location: 'Input manager side panel',
      idea: idea.id,
    });
  };

  return (
    <PropertyRow label={formatMessage(messages.filterAssignee)}>
      <PropertyMenu label={current?.label ?? ''}>
        {(close) => (
          <OptionList
            options={options}
            selected={[assigneeId]}
            searchable={options.length > 8}
            onToggle={(newAssigneeId) => {
              if (newAssigneeId !== assigneeId) assign(newAssigneeId);
              close();
            }}
          />
        )}
      </PropertyMenu>
    </PropertyRow>
  );
};

export default AssigneeProperty;
