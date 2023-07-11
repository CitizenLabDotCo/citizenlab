import React from 'react';

// components
import { Button, colors } from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError } from 'utils/helperUtils';

// api
import useBasket from 'api/baskets/useBasket';
import useBasketsIdeas from 'api/baskets_ideas/useBasketsIdeas';
import useAddIdeaToBasket from 'api/baskets/useAddIdeaToBasket';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isIdeaInBasket } from 'components/AddToBasketButton/utils';

// types
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

export const VOTES_EXCEEDED_ERROR_EVENT = 'votesExceededError';
export const VOTES_PER_OPTION_EXCEEDED_ERROR_EVENT =
  'votesPerOptionExceededError';

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

  const { data: basket } = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );

  const { mutate: addToBasket, isLoading } = useAddIdeaToBasket();
  const { data: basketsIdeas } = useBasketsIdeas(basket?.data.id);

  const ideaInBasket = isIdeaInBasket(ideaId, basketsIdeas);

  const onAdd = async () => {
    addToBasket({ idea_id: ideaId, votes: 1 });
  };

  const onRemove = async () => {
    addToBasket({ idea_id: ideaId, votes: null });
  };

  return (
    <Button
      buttonStyle={ideaInBasket ? 'primary' : buttonStyle}
      bgColor={ideaInBasket ? colors.success : undefined}
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
      processing={isLoading}
    />
  );
};

export default AssignSingleVoteButton;
