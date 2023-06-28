import React, { memo, FormEvent } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import AddToBasketButton from './AddToBasketButton';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';
import useBasket from 'api/baskets/useBasket';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useAssignBudget from './useAssignBudget';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { getParticipationContext } from './utils';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import FormattedBudget from 'utils/currency/FormattedBudget';

// styles
import styled from 'styled-components';
import { fontSizes, colors, defaultCardStyle, media } from 'utils/styleUtils';

// typings
import { ScreenReaderOnly } from 'utils/a11y';
import PBExpenses from 'containers/ProjectsShowPage/shared/pb/PBExpenses';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

const IdeaPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  ${media.tablet`
    padding: 20px;
    background: ${colors.background};
  `}
`;

const BudgetWithButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
`;

const Budget = styled.div`
  width: 100%;
  height: 90px;
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.m}px;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3px;
  ${defaultCardStyle};
`;

const StyledPBExpenses = styled(PBExpenses)`
  margin-top: 25px;
  padding: 20px;
`;

type TView = 'ideaCard' | 'ideaPage';

interface Props {
  view: TView;
  projectId: string;
  ideaId: string;
  className?: string;
}

const AssignBudgetControl = memo(
  ({ view, ideaId, className, projectId }: Props) => {
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

    const isPermitted =
      actionDescriptor.enabled ||
      actionDescriptor.disabled_reason !== 'not_permitted';
    const buttonVisible =
      isPermitted &&
      actionDescriptor.disabled_reason !== 'idea_not_in_current_phase';
    const buttonDisabled =
      basket?.data.attributes.submitted_at !== null ||
      (actionDescriptor.enabled === false &&
        !isFixableByAuthentication(actionDescriptor.disabled_reason));

    const buttonMessage = getAddRemoveButtonMessage(view, isInBasket);

    if (view === 'ideaCard') {
      return (
        <Box className={`e2e-assign-budget ${className || ''}`} width="100%">
          {buttonVisible && (
            <AddToBasketButton
              onClick={handleAddRemoveButtonClick}
              disabled={buttonDisabled}
              processing={processing}
              isInBasket={isInBasket}
              budget={ideaBudget}
              buttonMessage={buttonMessage}
            />
          )}
        </Box>
      );
    }

    return (
      <IdeaPageContainer
        className={`pbAssignBudgetControlContainer e2e-assign-budget ${
          className || ''
        }`}
      >
        <BudgetWithButtonWrapper>
          <Budget>
            <ScreenReaderOnly>
              <FormattedMessage {...messages.a11y_price} />
            </ScreenReaderOnly>
            <FormattedBudget value={ideaBudget} />
          </Budget>
          {buttonVisible && (
            <AddToBasketButton
              onClick={handleAddRemoveButtonClick}
              disabled={buttonDisabled}
              processing={processing}
              isInBasket={isInBasket}
              budget={ideaBudget}
              buttonMessage={buttonMessage}
            />
          )}
        </BudgetWithButtonWrapper>
        {isPermitted && (
          <StyledPBExpenses
            participationContextId={participationContextId}
            participationContextType={participationContextType}
            viewMode="column"
          />
        )}
      </IdeaPageContainer>
    );
  }
);

export default AssignBudgetControl;

function getAddRemoveButtonMessage(view: TView, isInBasket: boolean) {
  switch (view) {
    case 'ideaCard':
      if (isInBasket) {
        return messages.added;
      } else {
        return messages.add;
      }
    case 'ideaPage':
      if (isInBasket) {
        return messages.removeFromMyBasket;
      } else {
        return messages.addToMyBasket;
      }
  }
}
