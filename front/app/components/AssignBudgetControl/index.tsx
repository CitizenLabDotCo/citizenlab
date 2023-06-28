import React, { memo, FormEvent, useState } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import AddToBasketButton from './AddToBasketButton';

// hooks
import useAuthUser from 'api/me/useAuthUser';
import useIdeaById from 'api/ideas/useIdeaById';
import useBasket from 'api/baskets/useBasket';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';
import useAddBasket from 'api/baskets/useAddBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'containers/ProjectsShowPage/shared/pb/tracks';

// utils
import {
  isNilOrError,
  capitalizeParticipationContextType,
} from 'utils/helperUtils';
import { isFixableByAuthentication } from 'utils/actionDescriptors';
import eventEmitter from 'utils/eventEmitter';
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

export const BUDGET_EXCEEDED_ERROR_EVENT = 'budgetExceededError';

type TView = 'ideaCard' | 'ideaPage';

interface Props {
  view: TView;
  projectId: string;
  ideaId: string;
  className?: string;
}

const timeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const AssignBudgetControl = memo(
  ({ view, ideaId, className, projectId }: Props) => {
    const { data: authUser } = useAuthUser();
    const { data: idea } = useIdeaById(ideaId);
    const { data: project } = useProjectById(projectId);
    const { data: phases } = usePhases(projectId);
    const { mutateAsync: addBasket } = useAddBasket(projectId);
    const { mutateAsync: updateBasket } = useUpdateBasket();

    const participationContext = getParticipationContext(project, idea, phases);
    const participationContextType =
      project?.data.attributes.process_type === 'continuous'
        ? 'project'
        : 'phase';

    const participationContextId = participationContext?.id || null;
    const { data: basket } = useBasket(
      participationContext?.relationships?.user_basket?.data?.id
    );
    const maxBudget = participationContext?.attributes.voting_max_total;
    const ideaBudget = idea?.data.attributes.budget;
    const basketTotal = basket?.data.attributes.total_budget;

    const [processing, setProcessing] = useState(false);

    if (isNilOrError(idea) || !ideaBudget || !participationContextId) {
      return null;
    }

    const actionDescriptor = idea.data.attributes.action_descriptor.voting;

    if (!actionDescriptor) return null;

    const assignBudget = async () => {
      if (isNilOrError(authUser)) {
        return;
      }

      const done = async () => {
        await timeout(200);
        setProcessing(false);
      };

      setProcessing(true);

      if (!isNilOrError(basket)) {
        const basketIdeaIds = basket.data.relationships.ideas.data.map(
          (idea) => idea.id
        );
        const isInBasket = basketIdeaIds.includes(ideaId);
        let isPermitted = true;
        let newIdeas: string[] = [];

        if (isInBasket) {
          newIdeas = basket.data.relationships.ideas.data
            .filter((basketIdea) => basketIdea.id !== idea.data.id)
            .map((basketIdea) => basketIdea.id);
        } else {
          // If new idea causes exceeded budget, emit an error
          if (
            basketTotal &&
            maxBudget &&
            ideaBudget &&
            basketTotal + ideaBudget > maxBudget
          ) {
            eventEmitter.emit(BUDGET_EXCEEDED_ERROR_EVENT);
            isPermitted = false;
            setProcessing(false);
          }

          newIdeas = [
            ...basket.data.relationships.ideas.data.map(
              (basketIdea) => basketIdea.id
            ),
            idea.data.id,
          ];
        }

        if (isPermitted && !isNilOrError(basket)) {
          try {
            await updateBasket({
              id: basket.data.id,
              user_id: authUser.data.id,
              participation_context_id: participationContextId,
              participation_context_type: capitalizeParticipationContextType(
                participationContextType
              ),
              idea_ids: newIdeas,
              submitted_at: null,
            });
            done();
            trackEventByName(tracks.ideaAddedToBasket);
          } catch (error) {
            done();
          }
        }
      } else {
        try {
          await addBasket({
            user_id: authUser.data.id,
            participation_context_id: participationContextId,
            participation_context_type: capitalizeParticipationContextType(
              participationContextType
            ),
            idea_ids: [idea.data.id],
          });
          done();
          trackEventByName(tracks.basketCreated);
        } catch (error) {
          done();
        }
      }
    };

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
