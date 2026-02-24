import React from 'react';

import {
  Box,
  Button,
  Text,
  colors,
  useBreakpoint,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { useSearch } from 'utils/router';
import { useTheme } from 'styled-components';

import useBasket from 'api/baskets/useBasket';
import useVoting from 'api/baskets_ideas/useVoting';
import useIdeaById from 'api/ideas/useIdeaById';
import { IPhaseData } from 'api/phases/types';
import { getPhaseVoteTermMessage } from 'api/phases/utils';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import {
  isFixableByAuthentication,
  getPermissionsDisabledMessage,
} from 'utils/actionDescriptors';
import { useIntl } from 'utils/cl-intl';
import { isNil } from 'utils/helperUtils';

import messages from './messages';
import NumberInput from './NumberInput';
import {
  getMinusButtonDisabledMessage,
  getPlusButtonDisabledMessage,
} from './utils';

interface Props {
  ideaId: string;
  phase: IPhaseData;
  fillWidth?: boolean;
  onIdeaPage?: boolean;
}

const AssignMultipleVotesInput = ({
  ideaId,
  phase,
  fillWidth,
  onIdeaPage,
}: Props) => {
  const { getVotes, setVotes, userHasVotesLeft, numberOfVotesCast } =
    useVoting();
  const votes = getVotes?.(ideaId);
  const [searchParams] = useSearch({ strict: false });
  const isProcessing = searchParams.get('processing_vote') === ideaId;

  // participation context
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const basketId = phase.relationships?.user_basket?.data?.id;

  const { data: basket } = useBasket(basketId);
  const { data: idea } = useIdeaById(ideaId);

  // other
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const isPhoneOrSmaller = useBreakpoint('phone');

  // action descriptors
  const actionDescriptor = idea?.data.attributes.action_descriptors.voting;
  const votingDisabledReason = actionDescriptor?.disabled_reason;

  const onAdd = async (event) => {
    event.stopPropagation();
    event?.preventDefault();

    if (isNil(votes) || !actionDescriptor) return;

    if (actionDescriptor.enabled) {
      setVotes?.(ideaId, votes + 1);
      return;
    }

    if (isFixableByAuthentication(actionDescriptor.disabled_reason)) {
      const phaseId = phase.id;

      const context = {
        type: 'phase',
        action: 'voting',
        id: phaseId,
      } as const;

      const successAction: SuccessAction = {
        name: 'vote',
        params: {
          ideaId,
          phaseId,
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
    votingDisabledReason === 'idea_not_in_current_phase' ||
    votes === undefined ||
    votes === null ||
    userHasVotesLeft === undefined
  ) {
    return null;
  }

  const { voting_max_votes_per_idea, voting_max_total } = phase.attributes;

  if (isNil(voting_max_votes_per_idea)) return null;

  const xVotesMessage = getPhaseVoteTermMessage(phase, {
    vote: messages.xVotes,
    point: messages.xPoints,
    token: messages.xTokens,
    credit: messages.xCredits,
    percent: messages.xPercents,
  });

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const basketSubmitted = !!basket?.data?.attributes.submitted_at;
  const maxVotesPerIdeaReached = votes === voting_max_votes_per_idea;
  const maxVotesInTotal = voting_max_total ?? 0;

  const action =
    phase.attributes.voting_method === 'budgeting' ? 'budgeting' : 'voting';
  const permissionsDisabledMessage = getPermissionsDisabledMessage(
    action,
    actionDescriptor.disabled_reason,
    true
  );

  const minusButtonDisabledMessage =
    permissionsDisabledMessage ||
    getMinusButtonDisabledMessage(basketSubmitted, phase, onIdeaPage);

  const plusButtonDisabledMessage =
    permissionsDisabledMessage ||
    getPlusButtonDisabledMessage(
      userHasVotesLeft,
      basketSubmitted,
      maxVotesPerIdeaReached,
      phase,
      onIdeaPage
    );

  const minusButtonDisabledExplanation = minusButtonDisabledMessage
    ? formatMessage(minusButtonDisabledMessage)
    : undefined;

  const plusButtonDisabledExplanation = plusButtonDisabledMessage
    ? formatMessage(plusButtonDisabledMessage)
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
        <Tooltip
          disabled={!minusButtonDisabledExplanation}
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
        </Tooltip>

        <Box
          onClick={(event) => {
            event.stopPropagation();
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
            maxWidth={isPhoneOrSmaller ? '100px' : '160px'}
          >
            <NumberInput
              value={votes}
              max={Math.min(
                voting_max_votes_per_idea,
                maxVotesInTotal - (numberOfVotesCast ?? 0)
              )}
              onChange={(newValue) => setVotes?.(ideaId, newValue)}
            />
          </Box>
          <Text fontSize="m" ml="8px" my="auto" aria-live="polite">
            {formatMessage(xVotesMessage, {
              votes,
            })}
          </Text>
        </Box>
        <Tooltip
          disabled={!plusButtonDisabledExplanation}
          placement="bottom-end"
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
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box w="100%">
      <Tooltip
        disabled={!plusButtonDisabledExplanation}
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
            opacityDisabled="0.8"
            textDisabledColor={colors.coolGrey700}
            borderDisabledColor={colors.coolGrey700}
          >
            {formatMessage(messages.select)}
          </Button>
        </div>
      </Tooltip>
    </Box>
  );
};

export default AssignMultipleVotesInput;
