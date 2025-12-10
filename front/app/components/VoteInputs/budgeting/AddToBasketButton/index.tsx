import React, { FormEvent } from 'react';

import {
  Button,
  Icon,
  colors,
  Tooltip,
  Box,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useBasket from 'api/baskets/useBasket';
import useVoting from 'api/baskets_ideas/useVoting';
import useIdeaById from 'api/ideas/useIdeaById';
import { IPhaseData } from 'api/phases/types';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import { BUDGET_EXCEEDED_ERROR_EVENT } from 'components/ErrorToast/events';
import ScreenReaderCurrencyValue from 'components/ScreenReaderCurrencyValue';

import {
  isFixableByAuthentication,
  getPermissionsDisabledMessage,
} from 'utils/actionDescriptors';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import useFormatCurrency from 'utils/currency/useFormatCurrency';
import eventEmitter from 'utils/eventEmitter';
import { isNil } from 'utils/helperUtils';
import { isPhaseActive } from 'utils/projectUtils';

import messages from './messages';
import tracks from './tracks';
import { isButtonEnabled } from './utils';

interface Props {
  ideaId: string;
  phase: IPhaseData;
  buttonStyle: 'primary' | 'primary-outlined';
  onIdeaPage?: boolean;
}

const AddToBasketButton = ({
  ideaId,
  buttonStyle,
  phase,
  onIdeaPage,
}: Props) => {
  const { data: idea } = useIdeaById(ideaId);
  const { getVotes, setVotes, numberOfVotesCast } = useVoting();
  const { formatMessage } = useIntl();
  const formatCurrency = useFormatCurrency();

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const basketId = phase.relationships?.user_basket?.data?.id;
  const { data: basket } = useBasket(basketId);
  const ideaBudget = idea?.data.attributes.budget;

  const ideaInBasket = !!getVotes?.(ideaId);

  const [searchParams] = useSearchParams();
  const isProcessing = searchParams.get('processing_vote') === ideaId;

  if (!idea || !ideaBudget) {
    return null;
  }

  const phaseId = phase.id;

  const actionDescriptor = idea.data.attributes.action_descriptors.voting;
  if (!actionDescriptor) return null;

  const isPermitted =
    actionDescriptor.enabled ||
    actionDescriptor.disabled_reason !== 'user_not_permitted';
  const buttonVisible =
    isPermitted &&
    actionDescriptor.disabled_reason !== 'idea_not_in_current_phase';

  if (!buttonVisible) return null;

  const handleAddRemoveButtonClick = (event?: FormEvent) => {
    event?.preventDefault();

    if (actionDescriptor.enabled) {
      const maxBudget = phase.attributes.voting_max_total;

      if (isNil(maxBudget) || numberOfVotesCast === undefined) {
        return;
      }

      const ideaWillExceedBudget =
        !ideaInBasket && numberOfVotesCast + ideaBudget > maxBudget;

      if (ideaWillExceedBudget) {
        eventEmitter.emit(BUDGET_EXCEEDED_ERROR_EVENT);
        return;
      }

      setVotes?.(ideaId, ideaInBasket ? 0 : ideaBudget);
      trackEventByName(
        ideaInBasket ? tracks.ideaRemovedFromBasket : tracks.ideaAddedToBasket
      );
      return;
    }

    const budgetingDisabledReason = actionDescriptor.disabled_reason;

    if (isFixableByAuthentication(budgetingDisabledReason)) {
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
          votes: ideaBudget,
        },
      };

      triggerAuthenticationFlow({ context, successAction });
    }
  };

  const buttonMessage = ideaInBasket ? messages.added : messages.add;
  const buttonEnabled = isButtonEnabled(basket, actionDescriptor);

  const action =
    phase.attributes.voting_method === 'budgeting' ? 'budgeting' : 'voting';
  const permissionsDisabledMessage = getPermissionsDisabledMessage(
    action,
    actionDescriptor.disabled_reason,
    true
  );

  let disabledMessage = permissionsDisabledMessage || undefined;

  if (basket?.data.attributes.submitted_at) {
    disabledMessage = onIdeaPage
      ? messages.basketAlreadySubmittedIdeaPage1
      : messages.basketAlreadySubmitted1;
  }

  if (!isPhaseActive(phase)) {
    disabledMessage = messages.phaseNotActive;
  }

  const disabledExplanation = disabledMessage
    ? formatMessage(disabledMessage)
    : undefined;

  return (
    <Box w="100%">
      <Tooltip
        disabled={!disabledExplanation}
        placement="bottom"
        content={disabledExplanation}
      >
        <div>
          <Button
            onClick={handleAddRemoveButtonClick}
            disabled={!buttonEnabled}
            buttonStyle={buttonStyle}
            processing={isProcessing}
            bgColor={ideaInBasket ? colors.green500 : undefined}
            textColor={ideaInBasket ? colors.white : undefined}
            textHoverColor={ideaInBasket ? colors.white : undefined}
            bgHoverColor={ideaInBasket ? colors.green500 : undefined}
            borderColor={ideaInBasket ? colors.success : undefined}
            width="100%"
            className={`e2e-assign-budget-button ${
              ideaInBasket ? 'in-basket' : 'not-in-basket'
            }`}
            ariaDescribedby={`idea-budget-description-${ideaId}`}
          >
            {ideaInBasket && <Icon mb="4px" fill="white" name="check" />}
            <FormattedMessage {...buttonMessage} />
            {` (${formatCurrency(ideaBudget)})`}
          </Button>
        </div>
      </Tooltip>
      <ScreenReaderCurrencyValue
        amount={ideaBudget}
        id={`idea-budget-description-${ideaId}`}
      />
    </Box>
  );
};

export default AddToBasketButton;
