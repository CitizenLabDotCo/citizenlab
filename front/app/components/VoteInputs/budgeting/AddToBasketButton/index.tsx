import React, { FormEvent } from 'react';

// api
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useIdeaById from 'api/ideas/useIdeaById';
import useBasket from 'api/baskets/useBasket';
import useVoting from 'api/baskets_ideas/useVoting';

// components
import { Button, Icon } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// styling
import { colors } from 'utils/styleUtils';

// tracks
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';

// routing
import { useSearchParams } from 'react-router-dom';

// events
import eventEmitter from 'utils/eventEmitter';
import { BUDGET_EXCEEDED_ERROR_EVENT } from 'components/ErrorToast/events';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// utils
import { isButtonEnabled } from './utils';
import { isNil } from 'utils/helperUtils';
import { isFixableByAuthentication } from 'utils/actionDescriptors';

// typings
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

interface Props {
  ideaId: string;
  participationContext: IPhaseData | IProjectData;
  buttonStyle: 'primary' | 'primary-outlined';
  onIdeaPage?: boolean;
}

const AddToBasketButton = ({
  ideaId,
  buttonStyle,
  participationContext,
  onIdeaPage,
}: Props) => {
  const { data: appConfig } = useAppConfiguration();
  const { data: idea } = useIdeaById(ideaId);
  const { getVotes, setVotes, numberOfVotesCast } = useVoting();
  const { formatMessage } = useIntl();

  const basketId = participationContext.relationships?.user_basket?.data?.id;
  const { data: basket } = useBasket(basketId);
  const ideaBudget = idea?.data.attributes.budget;

  const ideaInBasket = !!getVotes?.(ideaId);

  const [searchParams] = useSearchParams();
  const isProcessing = searchParams.get('processing_vote') === ideaId;

  if (!idea || !ideaBudget) {
    return null;
  }

  const participationContextId = participationContext.id;
  const participationContextType = participationContext.type;

  const actionDescriptor = idea.data.attributes.action_descriptor.voting;
  if (!actionDescriptor) return null;

  const isPermitted =
    actionDescriptor.enabled ||
    actionDescriptor.disabled_reason !== 'not_permitted';
  const buttonVisible =
    isPermitted &&
    actionDescriptor.disabled_reason !== 'idea_not_in_current_phase';

  if (!buttonVisible) return null;

  const handleAddRemoveButtonClick = (event?: FormEvent) => {
    event?.preventDefault();

    if (actionDescriptor.enabled) {
      const maxBudget = participationContext.attributes.voting_max_total;

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
          votes: ideaBudget,
        },
      };

      triggerAuthenticationFlow({ context, successAction });
    }
  };

  const buttonMessage = ideaInBasket ? messages.added : messages.add;
  const buttonEnabled = isButtonEnabled(basket, actionDescriptor);
  const currency = appConfig?.data.attributes.settings.core.currency;

  const disabledMessage = basket?.data.attributes.submitted_at
    ? onIdeaPage
      ? messages.basketAlreadySubmittedIdeaPage
      : messages.basketAlreadySubmitted
    : undefined;

  const disabledExplanation = disabledMessage
    ? formatMessage(disabledMessage)
    : undefined;

  return (
    <Tippy
      disabled={!disabledExplanation}
      interactive={true}
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
        >
          {ideaInBasket && <Icon mb="4px" fill="white" name="check" />}
          <FormattedMessage {...buttonMessage} />
          {` (${ideaBudget} ${currency})`}
        </Button>
      </div>
    </Tippy>
  );
};

export default AddToBasketButton;
