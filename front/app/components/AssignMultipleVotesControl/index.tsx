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
import { getLatestRelevantPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

// style
import styled, { useTheme } from 'styled-components';

// utils
import eventEmitter from 'utils/eventEmitter';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

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
  const [votes, setVotes] = useState(-1);
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { data: authUser } = useAuthUser();
  const isMobileOrSmaller = useBreakpoint('phone');
  const { formatMessage } = useIntl();
  const latestRelevantPhase = phases
    ? getLatestRelevantPhase(phases.data)
    : null;
  const participationContext = latestRelevantPhase || project?.data;

  const { data: basket } = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );

  const isContinuousProject = true;

  const currentTotal = basket?.data?.attributes?.total_budget;
  const currentVotes = parseInt(votes.toString(), 10);
  const votingMax =
    latestRelevantPhase?.attributes?.voting_max_total ||
    project?.data.attributes.voting_max_total;

  const onAdd = async (event) => {
    event.stopPropagation();
    event?.preventDefault();

    console.log('currentTotal', currentTotal);
    console.log(votingMax && currentVotes + 1 > votingMax);
    if (
      // currentTotal &&
      votingMax &&
      // currentTotal + (currentVotes + 1) >= votingMax // TODO: Implement this once BE done
      currentVotes + 1 > votingMax
    ) {
      eventEmitter.emit(BUDGET_EXCEEDED_ERROR_EVENT);
    }
    // TODO: Implement OPTION_MAX_VOTE_EXCEEDED_ERROR_EVENT
    else {
      if (currentVotes <= 0) {
        setVotes(1);
      } else {
        setVotes(currentVotes + 1);
      }
    }
  };

  const onRemove = (event) => {
    event.stopPropagation();
    event?.preventDefault();
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
              type="number"
              min="0"
              onBlur={() => {
                if (votes.toString() === '') {
                  setVotes(0);
                }
              }}
            />
          </StyledBox>
          <Text fontSize="m" ml="8px" my="auto">
            {formatMessage(messages.xVotes, { votes })}
          </Text>
        </Box>
        {!basket?.data?.attributes.submitted_at && (
          <Button ml="8px" bgColor={theme.colors.tenantPrimary} onClick={onAdd}>
            <h1 style={{ margin: '0px' }}>+</h1>
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Button
      buttonStyle="primary-outlined"
      icon="vote-ballot"
      width="100%"
      onClick={onAdd}
    >
      Vote
    </Button>
  );
};

export default AssignMultipleVotesControl;
