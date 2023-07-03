import React, { useState } from 'react';

// components
import {
  Box,
  Button,
  Input,
  Text,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { BUDGET_EXCEEDED_ERROR_EVENT } from 'components/AssignBudgetControl';

// api
import useBasket from 'api/baskets/useBasket';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

// style
import styled, { useTheme } from 'styled-components';

// utils
import eventEmitter from 'utils/eventEmitter';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { isNilOrError } from 'utils/helperUtils';
import useIdeaById from 'api/ideas/useIdeaById';

export const VOTES_EXCEEDED_ERROR_EVENT = 'votesExceededError';
export const VOTES_PER_OPTION_EXCEEDED_ERROR_EVENT =
  'votesPerOptionExceededError';

const StyledBox = styled(Box)`
  input {
    border: none !important;
    font-size: x-large;
    padding: 0px !important;
    margin: 0px !important;
    text-align: center;
    font-weight: 600;
    font-size: 24px;
    max-width: 100%;
    size: 30;
    background-color: ${colors.grey100};
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type='number'] {
    -moz-appearance: textfield;
  }
`;
interface Props {
  projectId: string;
  ideaId: string;
  className?: string;
}

const AssignMultipleVotesControl = ({ projectId, ideaId }: Props) => {
  const theme = useTheme();
  const { data: project } = useProjectById(projectId);
  const { data: idea } = useIdeaById(ideaId);
  const { data: phases } = usePhases(projectId);
  const { data: authUser } = useAuthUser();
  const isMobileOrSmaller = useBreakpoint('phone');
  const { formatMessage } = useIntl();
  const currentPhase = phases ? getCurrentPhase(phases.data) : null;
  const participationContext = currentPhase || project?.data;

  const { data: basket } = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );
  const [votes, setVotes] = useState(
    basket?.data?.attributes?.total_votes || -1
  );

  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;
  const budgetingDisabledReason = actionDescriptor?.disabled_reason;

  const currentTotal = basket?.data?.attributes?.total_votes;
  const currentVotes = parseInt(votes.toString(), 10);
  const votingMax =
    currentPhase?.attributes?.voting_max_total ||
    project?.data.attributes.voting_max_total;
  const votingPerOptionMax =
    currentPhase?.attributes?.voting_max_votes_per_idea ||
    project?.data.attributes.voting_max_votes_per_idea;

  if (!actionDescriptor) return null;
  if (budgetingDisabledReason === 'idea_not_in_current_phase') return null;

  const onAdd = async (event) => {
    event.stopPropagation();
    event?.preventDefault();

    if (!authUser) {
      triggerAuthenticationFlow();
      return;
    }

    if (!participationContext) {
      return;
    }

    if (
      votingMax &&
      currentTotal &&
      currentTotal + (currentVotes + 1) >= votingMax
    ) {
      eventEmitter.emit(VOTES_EXCEEDED_ERROR_EVENT);
    }
    if (votingPerOptionMax && currentVotes + 1 > votingPerOptionMax) {
      eventEmitter.emit(VOTES_PER_OPTION_EXCEEDED_ERROR_EVENT);
    } else {
      if (currentVotes <= 0) {
        // if (basket?.data.id) {
        //   updateBasket({
        //     id: basket?.data.id,
        //     baskets_ideas_attributes: [{ idea_id: ideaId, votes: 1 }],
        //   });
        // } else {
        //   addBasket({
        //     participation_context_id: participationContext.id,
        //     participation_context_type: currentPhase ? 'Phase' : 'Project',
        //     baskets_ideas_attributes: [{ idea_id: ideaId, votes: 1 }],
        //   });
        // }
        setVotes(1);
      } else {
        // if (basket?.data.id) {
        //   updateBasket({
        //     id: basket?.data.id,
        //     baskets_ideas_attributes: [
        //       { idea_id: ideaId, votes: currentVotes + 1 },
        //     ],
        //   });
        // }
        // addBasket({
        //   participation_context_id: participationContext.id,
        //   participation_context_type: currentPhase ? 'Phase' : 'Project',
        //   baskets_ideas_attributes: [
        //     { idea_id: ideaId, votes: currentVotes + 1 },
        //   ],
        // });
        setVotes(currentVotes + 1);
      }
    }
  };

  const onRemove = (event) => {
    event.stopPropagation();
    event?.preventDefault();

    if (!authUser) {
      triggerAuthenticationFlow();
      return;
    }

    const currentVotes = parseInt(votes.toString(), 10);
    if (currentVotes < 0) {
      setVotes(0);
    } else {
      setVotes(parseInt(votes.toString(), 10) - 1);
    }
  };

  const onTextInputChange = async (event) => {
    const value = parseInt(event, 10);
    if (votingMax && value > votingMax) {
      // TODO: Calculate max remaining votes they could set, and use that.
      setVotes(1);
      eventEmitter.emit(BUDGET_EXCEEDED_ERROR_EVENT);
    } else {
      setVotes(event);
    }
  };

  if (votes > 0 || votes.toString() === '') {
    return (
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        style={{ cursor: 'default' }}
      >
        {!basket?.data?.attributes.submitted_at && (
          <Button
            mr="8px"
            bgColor={theme.colors.tenantPrimary}
            onClick={onRemove}
            ariaLabel={formatMessage(messages.removeVote)}
          >
            <h1 style={{ margin: '0px' }}>-</h1>
          </Button>
        )}

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
        >
          <StyledBox
            style={{
              width: `${votes.toString().length * 20}px`,
              maxWidth: `${isMobileOrSmaller ? '100px' : '160px'}`,
            }}
          >
            <Input
              value={votes.toString()}
              onChange={onTextInputChange}
              disabled={!isNilOrError(basket?.data?.attributes.submitted_at)}
              type="number"
              min="0"
              onBlur={() => {
                if (votes.toString() === '') {
                  setVotes(0);
                }
              }}
              ariaLabel={formatMessage(messages.inputTextVotes)}
            />
          </StyledBox>
          <Text fontSize="m" ml="8px" my="auto" aria-live="polite">
            {formatMessage(messages.xVotes, { votes })}
          </Text>
        </Box>
        {!basket?.data?.attributes.submitted_at && (
          <Button
            ariaLabel={formatMessage(messages.addVote)}
            ml="8px"
            bgColor={theme.colors.tenantPrimary}
            onClick={onAdd}
          >
            <h1 style={{ margin: '0px' }}>+</h1>
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Button
      buttonStyle="primary-outlined"
      disabled={!isNilOrError(basket?.data?.attributes.submitted_at)}
      icon="vote-ballot"
      width="100%"
      onClick={onAdd}
    >
      {formatMessage(messages.vote)}
    </Button>
  );
};

export default AssignMultipleVotesControl;
