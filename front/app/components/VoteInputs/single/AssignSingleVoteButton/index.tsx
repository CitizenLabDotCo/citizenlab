import React from 'react';

import {
  Button,
  colors,
  Tooltip,
  Box,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useBasket from 'api/baskets/useBasket';
import useVoting from 'api/baskets_ideas/useVoting';
import useIdeaById from 'api/ideas/useIdeaById';
import { IPhaseData } from 'api/phases/types';

import useCustomAccessDeniedMessage from 'hooks/useCustomAccessDeniedMessage';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import { VOTES_EXCEEDED_ERROR_EVENT } from 'components/ErrorToast/events';

import {
  getPermissionsDisabledMessage,
  isFixableByAuthentication,
} from 'utils/actionDescriptors';
import { useIntl } from 'utils/cl-intl';
import eventEmitter from 'utils/eventEmitter';
import { isPhaseActive } from 'utils/projectUtils';

import messages from './messages';

interface Props {
  phase: IPhaseData;
  ideaId: string;
  buttonStyle: 'primary' | 'primary-outlined';
  onIdeaPage?: boolean;
}

const AssignSingleVoteButton = ({
  ideaId,
  buttonStyle,
  phase,
  onIdeaPage,
}: Props) => {
  const { formatMessage } = useIntl();

  const { data: idea } = useIdeaById(ideaId);
  const { data: basket } = useBasket(
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    phase.relationships?.user_basket?.data?.id
  );
  const { getVotes, setVotes, numberOfVotesCast } = useVoting();
  const ideaInBasket = !!getVotes?.(ideaId);

  const [searchParams] = useSearchParams();
  const isProcessing = searchParams.get('processing_vote') === ideaId;

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const maxVotes = phase?.attributes.voting_max_total;
  const maxVotesReached = maxVotes && numberOfVotesCast === maxVotes;

  const actionDescriptor = idea?.data.attributes.action_descriptors.voting;

  const customAccessDeniedMessage = useCustomAccessDeniedMessage({
    phaseId: phase.id,
    action: 'voting',
    disabledReason: actionDescriptor?.disabled_reason,
  });

  if (
    !actionDescriptor ||
    actionDescriptor.disabled_reason === 'idea_not_in_current_phase'
  ) {
    return null;
  }

  const vote = () => {
    if (actionDescriptor.enabled) {
      ideaInBasket ? onRemove() : onAdd();
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
    }
  };

  const onAdd = async () => {
    if (numberOfVotesCast === undefined) {
      return;
    }

    if (maxVotesReached) {
      eventEmitter.emit(VOTES_EXCEEDED_ERROR_EVENT);
      return;
    }

    setVotes?.(ideaId, 1);
  };

  const onRemove = async () => {
    setVotes?.(ideaId, 0);
  };

  const getButtonDisabledExplanation = () => {
    const action =
      phase.attributes.voting_method === 'budgeting' ? 'budgeting' : 'voting';
    const permissionDisabledMessage = getPermissionsDisabledMessage(
      action,
      actionDescriptor.disabled_reason,
      true
    );

    // Show custom message if available
    if (customAccessDeniedMessage) {
      return customAccessDeniedMessage;
    }

    if (permissionDisabledMessage) {
      return formatMessage(permissionDisabledMessage);
    }

    if (!isPhaseActive(phase)) {
      return formatMessage(messages.phaseNotActive);
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (basket?.data?.attributes.submitted_at) {
      return formatMessage(
        onIdeaPage ? messages.votesSubmittedIdeaPage1 : messages.votesSubmitted1
      );
    }

    if (maxVotesReached && !ideaInBasket) {
      return formatMessage(messages.maxVotesReached);
    }

    return null;
  };

  const disabledButtonExplanation = getButtonDisabledExplanation();

  return (
    <Box w="100%">
      <Tooltip
        disabled={!disabledButtonExplanation}
        placement="bottom"
        content={disabledButtonExplanation}
      >
        <div>
          <Button
            buttonStyle={ideaInBasket ? 'primary' : buttonStyle}
            bgColor={ideaInBasket ? colors.success : undefined}
            borderColor={ideaInBasket ? colors.success : undefined}
            disabled={!!disabledButtonExplanation}
            processing={isProcessing}
            icon={ideaInBasket ? 'check' : 'vote-ballot'}
            className="e2e-single-vote-button"
            onClick={vote}
            text={
              ideaInBasket
                ? formatMessage(messages.selected)
                : formatMessage(messages.select)
            }
          />
        </div>
      </Tooltip>
    </Box>
  );
};

export default AssignSingleVoteButton;
