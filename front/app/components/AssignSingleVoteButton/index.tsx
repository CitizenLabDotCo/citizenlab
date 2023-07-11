import React from 'react';

// components
import { Button, colors } from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';

// api
import useIdeaById from 'api/ideas/useIdeaById';
import useBasket from 'api/baskets/useBasket';
import useVoting from 'api/baskets_ideas/useVoting';

// events
import eventEmitter from 'utils/eventEmitter';
import { VOTES_EXCEEDED_ERROR_EVENT } from 'components/ErrorToast/events';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// types
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

interface Props {
  participationContext?: IPhaseData | IProjectData | null;
  ideaId: string;
  buttonStyle: 'primary' | 'primary-outlined';
}

const AssignSingleVoteButton = ({
  ideaId,
  buttonStyle,
  participationContext,
}: Props) => {
  const { formatMessage } = useIntl();

  const { data: idea } = useIdeaById(ideaId);
  const { data: basket } = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );
  const { getVotes, setVotes, numberOfVotesCast } = useVoting();
  const ideaInBasket = !!getVotes?.(ideaId);

  // permissions
  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;
  if (!actionDescriptor) return null;

  const onAdd = async () => {
    const maxVotes = participationContext?.attributes.voting_max_total;
    if (!maxVotes || numberOfVotesCast === undefined) {
      return;
    }

    if (numberOfVotesCast === maxVotes) {
      eventEmitter.emit(VOTES_EXCEEDED_ERROR_EVENT);
      return;
    }

    setVotes?.(ideaId, 1);
  };

  const onRemove = async () => {
    setVotes?.(ideaId, 0);
  };

  return (
    <Button
      buttonStyle={ideaInBasket ? 'primary' : buttonStyle}
      bgColor={ideaInBasket ? colors.success : undefined}
      borderColor={ideaInBasket ? colors.success : undefined}
      disabled={!isNilOrError(basket?.data?.attributes.submitted_at)}
      icon={ideaInBasket ? 'check' : 'vote-ballot'}
      onClick={() => (ideaInBasket ? onRemove() : onAdd())}
      text={
        ideaInBasket
          ? formatMessage(messages.voted)
          : formatMessage(messages.vote)
      }
      width="100%"
      minWidth="240px"
    />
  );
};

export default AssignSingleVoteButton;
