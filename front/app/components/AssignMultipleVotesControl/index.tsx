import {
  Box,
  Button,
  Input,
  Text,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import useBasket from 'api/baskets/useBasket';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';
import { BUDGET_EXCEEDED_ERROR_EVENT } from 'components/AssignBudgetControl';
import React, { useState } from 'react';
import styled, { useTheme } from 'styled-components';
import eventEmitter from 'utils/eventEmitter';

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
  const isContinuousProject = true;
  const latestRelevantPhase = phases
    ? getLatestRelevantPhase(phases.data)
    : null;

  const participationContext = project?.data;

  const { data: basket } = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );

  const onAdd = async (event) => {
    event.stopPropagation();
    event?.preventDefault();
    const currentVotes = parseInt(votes.toString(), 10);
    if (
      basket?.data.attributes.total_budget + (currentVotes + 1) >=
      latestRelevantPhase?.attributes?.voting_max_total
    ) {
      console.log('HERE 1');
      eventEmitter.emit(BUDGET_EXCEEDED_ERROR_EVENT);
    }
    // else if (currentVotes + 1 > latestRelevantPhase?.attributes?.voting_max_votes_per_idea) {
    //   console.log("HERE 2");
    //   eventEmitter.emit(BUDGET_EXCEEDED_ERROR_EVENT);
    // }  // TODO: Implement this
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
    setVotes(event);
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
            votes
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
