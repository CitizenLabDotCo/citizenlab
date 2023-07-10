import React, { FormEvent } from 'react';

// api
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useIdeaById from 'api/ideas/useIdeaById';
import useBasket from 'api/baskets/useBasket';
import useBasketsIdeas from 'api/baskets_ideas/useBasketsIdeas';
import useProjectById from 'api/projects/useProjectById';
import useAssignBudget from './useAssignBudget';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// components
import { Button, Icon } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import { colors } from 'utils/styleUtils';

// utils
import { isNilOrError } from 'utils/helperUtils';
import {
  ActionDescriptorFutureEnabled,
  isFixableByAuthentication,
} from 'utils/actionDescriptors';

// tracks
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';

// typings
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { IBasket } from 'api/baskets/types';
import { IdeaVotingDisabledReason } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

interface Props {
  ideaId: string;
  projectId: string;
  participationContext?: IPhaseData | IProjectData | null;
  buttonStyle: 'primary' | 'primary-outlined';
}

const isButtonEnabled = (
  basket: IBasket | undefined,
  actionDescriptor: ActionDescriptorFutureEnabled<IdeaVotingDisabledReason>
) => {
  const actionDisabledAndNotFixable =
    actionDescriptor.enabled === false &&
    !isFixableByAuthentication(actionDescriptor.disabled_reason);

  if (actionDisabledAndNotFixable) return false;

  if (basket === undefined) {
    return true;
  }

  const basketNotSubmittedYet = basket.data.attributes.submitted_at === null;
  return basketNotSubmittedYet;
};

const isIdeaInBasket = () => {};

const AddToBasketButton = ({
  ideaId,
  projectId,
  buttonStyle,
  participationContext,
}: Props) => {
  const { data: appConfig } = useAppConfiguration();
  const { data: idea } = useIdeaById(ideaId);
  const { data: project } = useProjectById(projectId);
  const { assignBudget, processing } = useAssignBudget({ ideaId });

  const participationContextType =
    project?.data.attributes.process_type === 'continuous'
      ? 'project'
      : 'phase';

  const participationContextId = participationContext?.id || null;
  const basketId = participationContext?.relationships?.user_basket?.data?.id;
  const isInBasket = !!basketId;
  const { data: basket } = useBasket(basketId);
  const ideaBudget = idea?.data.attributes.budget;

  const { data: basketsIdeas } = useBasketsIdeas(basket?.data.id);

  if (isNilOrError(idea) || !ideaBudget || !participationContextId) {
    return null;
  }

  const actionDescriptor = idea.data.attributes.action_descriptor.voting;
  if (!actionDescriptor) return null;

  const isPermitted =
    actionDescriptor.enabled ||
    actionDescriptor.disabled_reason !== 'not_permitted';
  const buttonVisible =
    isPermitted &&
    actionDescriptor.disabled_reason !== 'idea_not_in_current_phase';

  if (!buttonVisible) return null;

  const ideaInBasket = isIdeaInBasket(ideaId, basketsIdeas);

  const handleAddRemoveButtonClick = (event?: FormEvent) => {
    event?.preventDefault();

    if (actionDescriptor.enabled) {
      // const maxBudget = participationContext?.attributes.voting_max_total;
      // const ideaBudget = idea?.data.attributes.budget;
      // const basketTotal = basket?.data.attributes.total_votes;

      // if (!maxBudget || !ideaBudget || !basketTotal)

      assignBudget(isInBasket ? 'remove' : 'add');
      trackEventByName(
        isInBasket ? tracks.ideaRemovedFromBasket : tracks.ideaAddedToBasket
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
        name: 'assignBudget',
        params: {
          ideaId,
          participationContextId,
          participationContextType,
        },
      };

      triggerAuthenticationFlow({ context, successAction });
    }
  };

  const buttonMessage = isInBasket ? messages.added : messages.add;
  const buttonEnabled = isButtonEnabled(basket, actionDescriptor);
  const currency = appConfig?.data.attributes.settings.core.currency;

  return (
    <Button
      onClick={handleAddRemoveButtonClick}
      disabled={!buttonEnabled}
      processing={processing}
      buttonStyle={buttonStyle}
      bgColor={isInBasket ? colors.green500 : undefined}
      textColor={isInBasket ? colors.white : undefined}
      textHoverColor={isInBasket ? colors.white : undefined}
      bgHoverColor={isInBasket ? colors.green500 : undefined}
      borderColor={isInBasket ? colors.success : undefined}
      width="100%"
      className={`e2e-assign-budget-button ${
        isInBasket ? 'in-basket' : 'not-in-basket'
      }`}
    >
      {isInBasket && <Icon mb="4px" fill="white" name="check" />}
      <FormattedMessage {...buttonMessage} />
      {` (${ideaBudget} ${currency})`}
    </Button>
  );
};

export default AddToBasketButton;
