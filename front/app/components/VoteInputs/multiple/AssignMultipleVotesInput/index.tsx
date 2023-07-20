import React from 'react';

// components
import {
  Box,
  Button,
  Text,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import NumberInput from './NumberInput';

// api
import useBasket from 'api/baskets/useBasket';
import useIdeaById from 'api/ideas/useIdeaById';
import useVoting from 'api/baskets_ideas/useVoting';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// styling
import { useTheme } from 'styled-components';

// i18n
import { useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import messages from './messages';

// routing
import { useSearchParams } from 'react-router-dom';

// utils
import { isNil } from 'utils/helperUtils';
import { isFixableByAuthentication } from 'utils/actionDescriptors';
import {
  getMinusButtonDisabledMessage,
  getPlusButtonDisabledMessage,
} from './utils';

// typings
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

interface Props {
  ideaId: string;
  participationContext: IPhaseData | IProjectData;
  fillWidth?: boolean;
  onIdeaPage?: boolean;
}

const AssignMultipleVotesInput = ({
  ideaId,
  participationContext,
  fillWidth,
  onIdeaPage,
}: Props) => {
  const { getVotes, setVotes, userHasVotesLeft, numberOfVotesCast } =
    useVoting();
  const votes = getVotes?.(ideaId);
  const [searchParams] = useSearchParams();
  const isProcessing = searchParams.get('processing_vote') === ideaId;

  // participation context
  const basketId = participationContext.relationships?.user_basket?.data?.id;

  // api
  const { data: basket } = useBasket(basketId);
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

    if (isNil(votes) || !actionDescriptor) return;

    if (actionDescriptor.enabled) {
      setVotes?.(ideaId, votes + 1);
      return;
    }

    if (isFixableByAuthentication(actionDescriptor.disabled_reason)) {
      const participationContextId = participationContext.id;
      const participationContextType = participationContext.type;

      const context = {
        type: participationContextType,
        action: 'voting',
        id: participationContextId,
      } as const;

      const successAction: SuccessAction = {
        name: 'vote',
        params: {
          ideaId,
          participationContextId,
          participationContextType,
          votes: 1,
        },
      };

      triggerAuthenticationFlow({ context, successAction });

      return;
    }
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
    votes === undefined ||
    votes === null ||
    userHasVotesLeft === undefined
  ) {
    return null;
  }

  const {
    voting_term_singular_multiloc,
    voting_term_plural_multiloc,
    voting_max_votes_per_idea,
    voting_max_total,
  } = participationContext.attributes;

  if (isNil(voting_max_votes_per_idea)) return null;

  const votingTermSingular =
    localize(voting_term_singular_multiloc) ||
    formatMessage(messages.vote).toLowerCase();
  const votingTermPlural =
    localize(voting_term_plural_multiloc) ||
    formatMessage(messages.votes).toLowerCase();

  const basketSubmitted = !!basket?.data?.attributes.submitted_at;
  const maxVotesPerIdeaReached = votes === voting_max_votes_per_idea;
  const maxVotes = voting_max_total ?? 0;

  const minusButtonDisabledMessage = getMinusButtonDisabledMessage(
    basketSubmitted,
    onIdeaPage
  );

  const plusButtonDisabledMessage = getPlusButtonDisabledMessage(
    userHasVotesLeft,
    basketSubmitted,
    maxVotesPerIdeaReached,
    onIdeaPage
  );

  const minusButtonDisabledExplanation = minusButtonDisabledMessage
    ? formatMessage(minusButtonDisabledMessage)
    : undefined;

  const plusButtonDisabledExplanation = plusButtonDisabledMessage
    ? formatMessage(plusButtonDisabledMessage, {
        maxVotes: voting_max_votes_per_idea,
      })
    : undefined;

  if (votes > 0) {
    return (
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        className="e2e-multiple-votes-widget"
        style={{ cursor: 'default' }}
        flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
      >
        <Tippy
          disabled={!minusButtonDisabledExplanation}
          interactive={true}
          placement="bottom"
          content={minusButtonDisabledExplanation}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              mr="8px"
              bgColor={theme.colors.tenantPrimary}
              onClick={onRemove}
              className="e2e-vote-minus"
              ariaLabel={formatMessage(messages.removeVote)}
              disabled={!!minusButtonDisabledExplanation}
            >
              <h1 style={{ margin: '0px' }}>-</h1>
            </Button>
          </div>
        </Tippy>

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
            <NumberInput
              value={votes}
              max={Math.min(
                voting_max_votes_per_idea,
                maxVotes - (numberOfVotesCast ?? 0)
              )}
              onChange={(newValue) => setVotes?.(ideaId, newValue)}
            />
          </Box>
          <Text fontSize="m" ml="8px" my="auto" aria-live="polite">
            {formatMessage(messages.xVotes, {
              votes,
              singular: votingTermSingular,
              plural: votingTermPlural,
            })}
          </Text>
        </Box>
        <Tippy
          disabled={!plusButtonDisabledExplanation}
          interactive={true}
          placement="bottom"
          content={plusButtonDisabledExplanation}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              ariaLabel={formatMessage(messages.addVote)}
              disabled={!!plusButtonDisabledExplanation}
              className="e2e-vote-plus"
              ml="8px"
              bgColor={theme.colors.tenantPrimary}
              onClick={onAdd}
            >
              <h1 style={{ margin: '0px' }}>+</h1>
            </Button>
          </div>
        </Tippy>
      </Box>
    );
  }

  return (
    <Tippy
      disabled={!plusButtonDisabledExplanation}
      interactive={true}
      placement="bottom"
      content={plusButtonDisabledExplanation}
    >
      <div>
        <Button
          buttonStyle="primary-outlined"
          disabled={!!plusButtonDisabledExplanation}
          processing={isProcessing}
          className="e2e-multiple-votes-button"
          icon="vote-ballot"
          width="100%"
          onClick={onAdd}
        >
          {formatMessage(messages.vote)}
        </Button>
      </div>
    </Tippy>
  );
};

export default AssignMultipleVotesInput;
