import React, { FormEvent } from 'react';

// api
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useIdeaById from 'api/ideas/useIdeaById';
import useBasket from 'api/baskets/useBasket';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
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
import { useTheme } from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';
import {
  ActionDescriptorFutureEnabled,
  isFixableByAuthentication,
} from 'utils/actionDescriptors';
import { getParticipationContext } from './utils';

// typings
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { IBasket } from 'api/baskets/types';
import { IdeaVotingDisabledReason } from 'api/ideas/types';

interface Props {
  ideaId: string;
  projectId: string;
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

const AddToBasketButton = ({ ideaId, projectId }: Props) => {
  const theme = useTheme();
  const { data: appConfig } = useAppConfiguration();
  const { data: idea } = useIdeaById(ideaId);
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const { assignBudget, processing } = useAssignBudget({ projectId, ideaId });

  const participationContext = getParticipationContext(project, idea, phases);
  const participationContextType =
    project?.data.attributes.process_type === 'continuous'
      ? 'project'
      : 'phase';

  const participationContextId = participationContext?.id || null;
  const { data: basket } = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );
  const ideaBudget = idea?.data.attributes.budget;

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

  const handleAddRemoveButtonClick = (event?: FormEvent) => {
    event?.preventDefault();

    if (actionDescriptor.enabled) {
      assignBudget();
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
          basket: basket?.data,
        },
      };

      triggerAuthenticationFlow({ context, successAction });
    }
  };

  const basketIdeaIds = !isNilOrError(basket)
    ? basket.data.relationships.ideas.data.map((idea) => idea.id)
    : [];
  const isInBasket = basketIdeaIds.includes(ideaId);
  const buttonMessage = isInBasket ? messages.added : messages.add;

  const buttonEnabled = isButtonEnabled(basket, actionDescriptor);

  const currency = appConfig?.data.attributes.settings.core.currency;

  return (
    <>
      <Button
        onClick={handleAddRemoveButtonClick}
        disabled={!buttonEnabled}
        processing={processing}
        bgColor={isInBasket ? colors.green500 : colors.white}
        textColor={isInBasket ? colors.white : theme.colors.tenantPrimary}
        textHoverColor={isInBasket ? colors.white : theme.colors.tenantPrimary}
        bgHoverColor={isInBasket ? colors.green500 : 'white'}
        borderColor={isInBasket ? '' : theme.colors.tenantPrimary}
        width="100%"
        className={`e2e-assign-budget-button ${
          isInBasket ? 'in-basket' : 'not-in-basket'
        }`}
      >
        {isInBasket && <Icon mb="4px" fill="white" name="check" />}
        <FormattedMessage {...buttonMessage} />
        {` (${ideaBudget} ${currency})`}
      </Button>
    </>
  );
};

export default AddToBasketButton;
