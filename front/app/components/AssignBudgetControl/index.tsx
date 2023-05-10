import React, { memo, FormEvent, useState } from 'react';

// components
import Button from 'components/UI/Button';

// services
import { getLatestRelevantPhase } from 'services/phases';
import { addBasket, updateBasket } from 'services/baskets';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useIdeaById from 'api/ideas/useIdeaById';
import useBasket from 'hooks/useBasket';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'containers/ProjectsShowPage/shared/pb/tracks';

// utils
import {
  isNilOrError,
  capitalizeParticipationContextType,
} from 'utils/helperUtils';
import streams from 'utils/streams';
import { isFixableByAuthentication } from 'utils/actionDescriptors';

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

const IdeaCardContainer = styled.div`
  display: flex;
  align-items: center;
`;

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
    const authUser = useAuthUser();
    const { data: idea } = useIdeaById(ideaId);
    const { data: project } = useProjectById(projectId);
    const { data: phases } = usePhases(projectId);

    const isContinuousProject =
      project?.data.attributes.process_type === 'continuous';

    const ideaPhaseIds = !isNilOrError(idea)
      ? idea.data.relationships?.phases?.data?.map((item) => item.id)
      : null;

    const ideaPhases = phases
      ? phases.data.filter(
          (phase) =>
            Array.isArray(ideaPhaseIds) && ideaPhaseIds.includes(phase.id)
        )
      : null;

    const latestRelevantIdeaPhase = ideaPhases
      ? getLatestRelevantPhase(ideaPhases)
      : null;

    const participationContext = isContinuousProject
      ? project.data
      : latestRelevantIdeaPhase;

    const participationContextType = isContinuousProject ? 'project' : 'phase';
    const participationContextId = participationContext?.id || null;
    const basket = useBasket(
      participationContext?.relationships?.user_basket?.data?.id
    );

    const [processing, setProcessing] = useState(false);

    if (
      isNilOrError(idea) ||
      !idea.data.attributes.budget ||
      !participationContextId
    ) {
      return null;
    }

    const actionDescriptor = idea.data.attributes.action_descriptor.budgeting;

    if (!actionDescriptor) return null;

    const assignBudget = async () => {
      if (isNilOrError(authUser)) {
        return;
      }

      const timeout = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      const done = async () => {
        await timeout(200);
        setProcessing(false);
      };

      setProcessing(true);

      if (!isNilOrError(basket)) {
        const basketIdeaIds = basket.relationships.ideas.data.map(
          (idea) => idea.id
        );
        const isInBasket = basketIdeaIds.includes(ideaId);

        let newIdeas: string[] = [];

        if (isInBasket) {
          newIdeas = basket.relationships.ideas.data
            .filter((basketIdea) => basketIdea.id !== idea.data.id)
            .map((basketIdea) => basketIdea.id);
        } else {
          newIdeas = [
            ...basket.relationships.ideas.data.map(
              (basketIdea) => basketIdea.id
            ),
            idea.data.id,
          ];
        }

        try {
          await updateBasket(basket.id, {
            user_id: authUser.id,
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
          streams.fetchAllWith({ dataId: [basket.id] });
        }
      } else {
        try {
          await addBasket({
            user_id: authUser.id,
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
          action: 'budgeting',
          id: participationContextId,
        } as const;

        const successAction: SuccessAction = {
          name: 'assignBudget',
          params: {
            ideaId,
            participationContextId,
            participationContextType,
            basket,
          },
        };

        triggerAuthenticationFlow({ context, successAction });
      }
    };

    const basketIdeaIds = !isNilOrError(basket)
      ? basket.relationships.ideas.data.map((idea) => idea.id)
      : [];
    const isInBasket = basketIdeaIds.includes(ideaId);

    const isPermitted =
      actionDescriptor.enabled ||
      actionDescriptor.disabled_reason !== 'not_permitted';
    const buttonVisible =
      isPermitted &&
      actionDescriptor.disabled_reason !== 'idea_not_in_current_phase';
    const buttonDisabled =
      actionDescriptor.enabled === false &&
      !isFixableByAuthentication(actionDescriptor.disabled_reason);

    const buttonMessage = getAddRemoveButtonMessage(view, isInBasket);

    const addRemoveButton = buttonVisible ? (
      <Button
        onClick={handleAddRemoveButtonClick}
        disabled={buttonDisabled}
        processing={processing}
        bgColor={isInBasket ? colors.red600 : colors.success}
        icon={!isInBasket ? 'basket-plus' : 'basket-minus'}
        className={`e2e-assign-budget-button ${
          isInBasket ? 'in-basket' : 'not-in-basket'
        }`}
      >
        <FormattedMessage {...buttonMessage} />
      </Button>
    ) : null;

    if (view === 'ideaCard') {
      return (
        <IdeaCardContainer className={`e2e-assign-budget ${className || ''}`}>
          {addRemoveButton}
        </IdeaCardContainer>
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
            <FormattedBudget value={idea.data.attributes.budget} />
          </Budget>
          {addRemoveButton}
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
        return messages.remove;
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
