import React, { FormEvent, useMemo } from 'react';

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

// tracks
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';

// events
import eventEmitter from 'utils/eventEmitter';
import { BUDGET_EXCEEDED_ERROR_EVENT } from 'components/ParticipationCTABars/VotingCTABar/events';

// utils
import { isIdeaInBasket, isButtonEnabled } from './utils';
import { isNil } from 'utils/helperUtils';
import { isFixableByAuthentication } from 'utils/actionDescriptors';

// typings
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

interface Props {
  ideaId: string;
  projectId: string;
  participationContext?: IPhaseData | IProjectData | null;
  buttonStyle: 'primary' | 'primary-outlined';
}

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
  const { data: basket } = useBasket(basketId);
  const ideaBudget = idea?.data.attributes.budget;

  const { data: basketsIdeas } = useBasketsIdeas(basket?.data.id);

  const ideaInBasket = useMemo(() => {
    return isIdeaInBasket(ideaId, basketsIdeas);
  }, [ideaId, basketsIdeas]);

  if (
    !idea ||
    !ideaBudget ||
    !participationContext ||
    !participationContextId
  ) {
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

    const maxBudget = participationContext.attributes.voting_max_total;
    const ideaBudget = idea.data.attributes.budget;
    const basketTotal = basket?.data.attributes.total_votes ?? 0;

    if (isNil(maxBudget) || ideaBudget === null) return;

    const ideaWillExceedBudget =
      !ideaInBasket && basketTotal + ideaBudget > maxBudget;

    if (ideaWillExceedBudget) {
      eventEmitter.emit(BUDGET_EXCEEDED_ERROR_EVENT);
      return;
    }

    if (actionDescriptor.enabled) {
      assignBudget(ideaInBasket ? 'remove' : 'add');
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

  const buttonMessage = ideaInBasket ? messages.added : messages.add;
  const buttonEnabled = isButtonEnabled(basket, actionDescriptor);
  const currency = appConfig?.data.attributes.settings.core.currency;

  return (
    <Button
      onClick={handleAddRemoveButtonClick}
      disabled={!buttonEnabled}
      processing={processing}
      buttonStyle={buttonStyle}
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
  );
};

export default AddToBasketButton;
