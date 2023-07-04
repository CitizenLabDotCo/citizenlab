import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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
import useBasketsIdeas from 'api/baskets_ideas/useBasketsIdeas';
import useAddBasketsIdea from 'api/baskets_ideas/useAddBasketsIdeas';
import useUpdateBasketsIdea from 'api/baskets_ideas/useUpdateBasketsIdea';
import useAddBasket from 'api/baskets/useAddBasket';
import useDeleteBasketsIdea from 'api/baskets_ideas/useDeleteBasketsIdea';

// style
import styled, { useTheme } from 'styled-components';

// utils
import eventEmitter from 'utils/eventEmitter';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { isNilOrError } from 'utils/helperUtils';
import { debounce } from 'lodash-es';

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

  // intl
  const { formatMessage } = useIntl();

  // utils
  const isMobileOrSmaller = useBreakpoint('phone');
  const [, setForceUpdate] = useState(Date.now());
  const debouncing = useRef(false);

  // api
  const { data: project } = useProjectById(projectId);
  const { data: idea } = useIdeaById(ideaId);
  const { data: phases } = usePhases(projectId);
  const { data: authUser } = useAuthUser();

  // participation context
  const currentPhase = phases ? getCurrentPhase(phases.data) : null;
  const participationContext = currentPhase || project?.data;

  // baskets
  const { mutateAsync: deleteBasketsIdea } = useDeleteBasketsIdea();
  const { mutateAsync: addBasket } = useAddBasket(
    participationContext?.id || ''
  );
  const { mutateAsync: addBasketsIdea } = useAddBasketsIdea();
  const { mutateAsync: updateBasketsIdea } = useUpdateBasketsIdea();
  const { data: basket } = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );
  const { data: basketsIdeas } = useBasketsIdeas(basket?.data.id);
  const currentBasketsIdeas: {
    ideaId: string;
    basketsIdeaId: string;
    votes: number;
  }[] = [];
  basketsIdeas?.data.map((basketIdea) => {
    const ideaId = basketIdea.relationships.idea.data['id'];
    const basketsIdeaId = basketIdea.id;
    const votes = basketIdea.attributes.votes;
    currentBasketsIdeas.push({ ideaId, basketsIdeaId, votes });
  });
  const currentIdeaFromBasket = currentBasketsIdeas.find(
    (basketsIdea) => basketsIdea.ideaId === ideaId
  );

  // action descriptors
  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;
  const budgetingDisabledReason = actionDescriptor?.disabled_reason;

  // voting
  const localVotes = useRef(currentIdeaFromBasket?.votes || 0); // Had tried with useState as well, but wasn't able to get that working with the mutations
  const initialVotes = useRef(currentIdeaFromBasket?.votes || 0);
  const hasSetInitialVotes = useRef(false);
  const basketTotal = basket?.data?.attributes?.total_votes;
  const votingMax = participationContext?.attributes?.voting_max_total;
  const votingPerOptionMax =
    participationContext?.attributes?.voting_max_votes_per_idea;

  // Update initial local votes when basket is loaded
  useEffect(() => {
    if (
      currentIdeaFromBasket?.votes &&
      !debouncing.current &&
      !hasSetInitialVotes.current
    ) {
      localVotes.current = currentIdeaFromBasket.votes;
      initialVotes.current = currentIdeaFromBasket.votes;
      hasSetInitialVotes.current = true;
      setForceUpdate(Date.now()); // Temporary hacky way to force a re-render while using useRef, though is we get useState working we can remove this..
    }
  }, [currentIdeaFromBasket?.votes]);

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
    if (votingMax && basketTotal) {
      if (
        basketTotal - initialVotes.current + (localVotes.current + 1) >
        votingMax // Used the initialVotes here to remove it from the current basketTotal, since localVotes + basketTotal aren't in sync.
      ) {
        eventEmitter.emit(VOTES_EXCEEDED_ERROR_EVENT);
        return;
      }
      if (votingPerOptionMax && localVotes.current + 1 > votingPerOptionMax) {
        eventEmitter.emit(VOTES_PER_OPTION_EXCEEDED_ERROR_EVENT);
        return;
      }
    }

    localVotes.current = localVotes.current + 1;
    debouncing.current = true;
    updateBasketDebounced();
  };

  const updateBasket = useCallback(() => {
    if (!participationContext) {
      return;
    }
    if (!basket) {
      // Create basket, and on success add new basketsIdea
      addBasket(
        {
          participation_context_id: participationContext?.id,
          participation_context_type: currentPhase ? 'Phase' : 'Project',
        },
        {
          onSuccess: (basket) => {
            addBasketsIdea({
              basketId: basket.data.id,
              idea_id: ideaId,
              votes: localVotes.current,
            });
          },
        }
      );
    }

    if (basket) {
      if (!currentIdeaFromBasket) {
        // Add new baskets idea
        addBasketsIdea({
          basketId: basket.data.id,
          idea_id: ideaId,
          votes: localVotes.current,
        });
      } else {
        if (localVotes.current === 0) {
          deleteBasketsIdea({
            basketId: basket.data.id,
            basketIdeaId: currentIdeaFromBasket.basketsIdeaId,
          });
        } else {
          // Update existing baskets idea
          updateBasketsIdea({
            basketId: basket.data.id,
            basketsIdeaId: currentIdeaFromBasket.basketsIdeaId,
            votes: localVotes.current,
          });
        }
      }
    }
    debouncing.current = false;
  }, [
    addBasket,
    addBasketsIdea,
    basket,
    currentIdeaFromBasket,
    currentPhase,
    deleteBasketsIdea,
    ideaId,
    participationContext,
    updateBasketsIdea,
  ]);

  // Debounced update function
  const updateBasketDebounced = useMemo(() => {
    return debounce(updateBasket, 100);
  }, [updateBasket]);

  const onRemove = async (event) => {
    event.stopPropagation();
    event?.preventDefault();

    if (!participationContext || !basket) {
      return;
    }

    localVotes.current = localVotes.current - 1;
    debouncing.current = true;
    updateBasketDebounced();
  };

  const onTextInputChange = async (event) => {
    console.log('TEXT INPUT: ', event);
    // localVotes.current = event;
    // debouncing.current = true;
    // updateBasketDebounced('remove');
  };

  if (!actionDescriptor) return null;
  if (budgetingDisabledReason === 'idea_not_in_current_phase') return null;

  if (localVotes.current > 0 || localVotes.current.toString() === '') {
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
              width: `${localVotes.current.toString().length * 20}px`,
              maxWidth: `${isMobileOrSmaller ? '100px' : '160px'}`,
            }}
          >
            <Input
              value={localVotes.current.toString()}
              onChange={onTextInputChange}
              disabled={!isNilOrError(basket?.data?.attributes.submitted_at)}
              type="number"
              min="0"
              onBlur={() => {
                onTextInputChange;
              }}
              ariaLabel={formatMessage(messages.inputTextVotes)}
            />
          </StyledBox>
          <Text fontSize="m" ml="8px" my="auto" aria-live="polite">
            {formatMessage(messages.xVotes, { votes: localVotes.current })}
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
