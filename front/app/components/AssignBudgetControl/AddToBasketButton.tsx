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
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

// styling
import { colors } from 'utils/styleUtils';
import { useTheme } from 'styled-components';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { getParticipationContext } from './utils';

// typings
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

interface Props {
  ideaId: string;
  projectId: string;
  inBasketMessage: MessageDescriptor;
  notInBasketMessage: MessageDescriptor;
}

const AddToBasketButton = ({
  ideaId,
  projectId,
  inBasketMessage,
  notInBasketMessage,
}: Props) => {
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
  const buttonMessage = isInBasket ? inBasketMessage : notInBasketMessage;

  const buttonDisabled =
    basket?.data.attributes.submitted_at !== null ||
    (actionDescriptor.enabled === false &&
      !isFixableByAuthentication(actionDescriptor.disabled_reason));

  const currency = appConfig?.data.attributes.settings.core.currency;

  return (
    <Button
      onClick={handleAddRemoveButtonClick}
      disabled={buttonDisabled}
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
  );
};

export default AddToBasketButton;
