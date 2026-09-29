import React from 'react';

import { IIdeaData } from 'api/ideas/types';
import useUpdateIdea from 'api/ideas/useUpdateIdea';

import { ManagerType } from 'components/admin/PostManager';
import { getIdeaOfficialFeedbackModalEventName } from 'components/admin/PostManager/components/IdeaOfficialFeedbackModal';
import tracks from 'components/admin/PostManager/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';

import messages from '../messages';
import OptionList from '../OptionList';
import usePickerOptions from '../usePickerOptions';

import PropertyMenu from './PropertyMenu';
import PropertyRow from './PropertyRow';

interface Props {
  idea: IIdeaData;
  type: ManagerType;
}

const StatusProperty = ({ idea, type }: Props) => {
  const { formatMessage } = useIntl();
  const { statusOptions } = usePickerOptions(
    type,
    idea.relationships.project.data.id
  );
  const { mutate: updateIdea } = useUpdateIdea();
  const statusId = idea.relationships.idea_status.data?.id;
  const current = statusOptions.find((option) => option.value === statusId);

  const changeStatus = (newStatusId: string) => {
    updateIdea({ id: idea.id, requestBody: { idea_status_id: newStatusId } });
    trackEventByName(tracks.ideaStatusChange, {
      location: 'Input manager side panel',
      idea: idea.id,
    });
    // Asks for an official update that explains the new status.
    eventEmitter.emit(getIdeaOfficialFeedbackModalEventName(idea.id));
  };

  return (
    <PropertyRow label={formatMessage(messages.filterStatus)}>
      <PropertyMenu label={current?.label ?? ''} color={current?.color}>
        {(close) => (
          <OptionList
            options={statusOptions}
            selected={statusId ? [statusId] : []}
            onToggle={(newStatusId) => {
              if (newStatusId !== statusId) changeStatus(newStatusId);
              close();
            }}
          />
        )}
      </PropertyMenu>
    </PropertyRow>
  );
};

export default StatusProperty;
