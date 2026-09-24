import React from 'react';

import { Box, Tooltip } from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';
import useUpdateIdea from 'api/ideas/useUpdateIdea';

import { getIdeaOfficialFeedbackModalEventName } from 'components/admin/PostManager/components/IdeaOfficialFeedbackModal';
import tracks from 'components/admin/PostManager/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';

import messages from '../messages';
import StatusChip from '../StatusChip';

interface Props {
  idea: IIdeaData;
  statuses: IIdeaStatusData[];
}

const DrawerStatus = ({ idea, statuses }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updateIdea } = useUpdateIdea();
  const currentStatusId = idea.relationships.idea_status.data?.id;

  const setStatus = (statusId: string) => {
    if (statusId === currentStatusId) return;

    updateIdea({ id: idea.id, requestBody: { idea_status_id: statusId } });
    trackEventByName(tracks.ideaStatusChange, {
      location: 'Manage view drawer',
      idea: idea.id,
    });
    // Offers to post an official update explaining the new status.
    eventEmitter.emit(getIdeaOfficialFeedbackModalEventName(idea.id));
  };

  return (
    <Box display="flex" flexWrap="wrap" gap="6px">
      {statuses.map((status) => {
        const manual = status.attributes.can_manually_transition_to;

        return (
          <Tooltip
            key={status.id}
            content={formatMessage(messages.automaticStatus)}
            disabled={manual}
          >
            <Box
              as="button"
              type="button"
              aria-pressed={status.id === currentStatusId}
              disabled={!manual}
              onClick={() => setStatus(status.id)}
              style={{
                cursor: manual ? 'pointer' : 'not-allowed',
                opacity: manual ? 1 : 0.5,
              }}
            >
              <StatusChip
                status={status}
                selected={status.id === currentStatusId}
              />
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default DrawerStatus;
