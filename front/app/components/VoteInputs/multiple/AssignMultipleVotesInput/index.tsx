import React from 'react';

// components
import {
  Box,
  Button,
  Text,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

// api
import useBasket from 'api/baskets/useBasket';
import useAuthUser from 'api/me/useAuthUser';
import useIdeaById from 'api/ideas/useIdeaById';
import useCumulativeVoting from 'api/baskets_ideas/useVoting';

// style
import { useTheme } from 'styled-components';

// events
// import eventEmitter from 'utils/eventEmitter';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// i18n
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import messages from './messages';

// utils
import { isNil } from 'utils/helperUtils';

// typings
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

interface Props {
  ideaId: string;
  participationContext: IPhaseData | IProjectData;
  fillWidth?: boolean;
}

const AssignMultipleVotesInput = ({
  ideaId,
  participationContext,
  fillWidth,
}: Props) => {
  const { getVotes, setVotes, userHasVotesLeft } = useCumulativeVoting();
  const votes = getVotes?.(ideaId);

  // participation context
  const basketId = participationContext.relationships?.user_basket?.data?.id;

  // api
  const { data: basket } = useBasket(basketId);
  const { data: authUser } = useAuthUser();
  const { data: idea } = useIdeaById(ideaId);

  // other
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const isMobileOrSmaller = useBreakpoint('phone');

  // action descriptors
  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;
  const budgetingDisabledReason = actionDescriptor?.disabled_reason;

  const onAdd = async (event) => {
    event.stopPropagation();
    event?.preventDefault();

    if (isNil(votes)) return;

    if (!authUser) {
      triggerAuthenticationFlow(); // TODO: Trigger with correct parameters
      return;
    }
    // Emit errors if maximum allowance exceeded
    // if (votingMax && basketTotal) {
    //   if (
    //     basketTotal - initialVotes.current + (localVotes.current + 1) >
    //     votingMax
    //   ) {
    //     eventEmitter.emit(VOTES_EXCEEDED_ERROR_EVENT);
    //     return;
    //   }
    //   if (votingPerOptionMax && localVotes.current + 1 > votingPerOptionMax) {
    //     eventEmitter.emit(VOTES_PER_OPTION_EXCEEDED_ERROR_EVENT);
    //     return;
    //   }
    // }

    setVotes?.(ideaId, votes + 1);
  };

  const onRemove = async (event) => {
    event.stopPropagation();
    event?.preventDefault();

    if (isNil(votes)) return;

    setVotes?.(ideaId, votes - 1);
  };

  if (
    !actionDescriptor ||
    budgetingDisabledReason === 'idea_not_in_current_phase' ||
    votes === undefined
  ) {
    return null;
  }

  const { voting_term_singular_multiloc, voting_term_plural_multiloc } =
    participationContext.attributes;

  const votingTermSingular =
    localize(voting_term_singular_multiloc) ??
    formatMessage(messages.vote).toLowerCase();
  const votingTermPlural =
    localize(voting_term_plural_multiloc) ??
    formatMessage(messages.votes).toLowerCase();

  const basketSubmitted = !!basket?.data?.attributes.submitted_at;
  const disableAddingVote = !userHasVotesLeft || basketSubmitted;

  if (votes === null) return null;

  if (votes > 0) {
    return (
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        style={{ cursor: 'default' }}
        flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
      >
        <Button
          mr="8px"
          bgColor={theme.colors.tenantPrimary}
          onClick={onRemove}
          ariaLabel={formatMessage(messages.removeVote)}
          disabled={basketSubmitted}
        >
          <h1 style={{ margin: '0px' }}>-</h1>
        </Button>

        <Box
          onClick={(event) => {
            event.stopPropagation();
            event?.preventDefault();
          }}
          display="flex"
          background={colors.grey100}
          borderRadius={'3px'}
          flexGrow={1}
          justifyContent="center"
          padding="8px"
          minWidth={fillWidth ? '140px' : 'auto'}
        >
          <Box
            w={`${votes.toString().length * 20}px`}
            maxWidth={isMobileOrSmaller ? '100px' : '160px'}
          >
            <Text mt="0px" mb="0px" fontSize="xxl" fontWeight="bold">
              {votes}
            </Text>
          </Box>
          <Text fontSize="m" ml="8px" my="auto" aria-live="polite">
            {formatMessage(messages.xVotes, {
              votes,
              singular: votingTermSingular,
              plural: votingTermPlural,
            })}
          </Text>
        </Box>
        {
          <Button
            ariaLabel={formatMessage(messages.addVote)}
            disabled={disableAddingVote}
            ml="8px"
            bgColor={theme.colors.tenantPrimary}
            onClick={onAdd}
          >
            <h1 style={{ margin: '0px' }}>+</h1>
          </Button>
        }
      </Box>
    );
  }

  return (
    <Button
      buttonStyle="primary-outlined"
      disabled={!!basket?.data?.attributes.submitted_at || !userHasVotesLeft}
      icon="vote-ballot"
      width="100%"
      onClick={onAdd}
    >
      {formatMessage(messages.vote)}
    </Button>
  );
};

export default AssignMultipleVotesInput;
