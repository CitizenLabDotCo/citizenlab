import React from 'react';

// components
import {
  Box,
  Button,
  Input,
  Text,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';

// api
import useBasket from 'api/baskets/useBasket';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';
import useIdeaById from 'api/ideas/useIdeaById';
import useAssignVote from './useAssignVote';

// style
import styled, { useTheme } from 'styled-components';

// utils
// import eventEmitter from 'utils/eventEmitter';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

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

// TODO remove
const VOTES = 2;

const AssignMultipleVotesControl = ({ projectId, ideaId }: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const isMobileOrSmaller = useBreakpoint('phone');

  // api
  const { data: project } = useProjectById(projectId);
  const { data: idea } = useIdeaById(ideaId);
  const { data: phases } = usePhases(projectId);
  const { data: authUser } = useAuthUser();

  // participation context
  const currentPhase = phases ? getCurrentPhase(phases.data) : null;
  const participationContext = currentPhase || project?.data;

  // baskets
  const { data: basket } = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );

  // action descriptors
  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;
  const budgetingDisabledReason = actionDescriptor?.disabled_reason;

  const { assignVote } = useAssignVote({ projectId, ideaId });

  const onAdd = async (event) => {
    event.stopPropagation();
    event?.preventDefault();

    if (!authUser) {
      triggerAuthenticationFlow(); // TODO: Trigger with correct parameters
      return;
    }

    if (!participationContext) {
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

    assignVote();
  };

  const onRemove = async (event) => {
    event.stopPropagation();
    event?.preventDefault();

    if (!participationContext || !basket) {
      return;
    }

    assignVote();
  };

  const onTextInputChange = async (_event) => {
    // console.log('TEXT INPUT: ', event);
  };

  if (!actionDescriptor) return null;
  if (budgetingDisabledReason === 'idea_not_in_current_phase') return null;

  if (VOTES > 0) {
    return (
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        style={{ cursor: 'default' }}
        flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
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
              width: `${VOTES.toString().length * 20}px`,
              maxWidth: `${isMobileOrSmaller ? '100px' : '160px'}`,
            }}
          >
            <Input
              value={VOTES.toString()}
              onChange={onTextInputChange}
              disabled={!!basket?.data?.attributes.submitted_at}
              type="number"
              min="0"
              onBlur={() => {
                onTextInputChange;
              }}
              ariaLabel={formatMessage(messages.inputTextVotes)}
            />
          </StyledBox>
          <Text fontSize="m" ml="8px" my="auto" aria-live="polite">
            {formatMessage(messages.xVotes, { votes: VOTES })}
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
      disabled={!!basket?.data?.attributes.submitted_at}
      icon="vote-ballot"
      width="100%"
      onClick={onAdd}
    >
      {formatMessage(messages.vote)}
    </Button>
  );
};

export default AssignMultipleVotesControl;
