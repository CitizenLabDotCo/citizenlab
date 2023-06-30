import React, { memo, FormEvent, useState } from 'react';

// components
import { Box, Button, Icon } from '@citizenlab/cl2-component-library';

// hooks
import useAuthUser from 'api/me/useAuthUser';
import useIdeaById from 'api/ideas/useIdeaById';
import useBasket from 'api/baskets/useBasket';
import useProjectById from 'api/projects/useProjectById';
import { queryClient } from 'utils/cl-react-query/queryClient';
import projectsKeys from 'api/projects/keys';
import phasesKeys from 'api/phases/keys';
import useAddBasket from 'api/baskets/useAddBasket';
import useUpdateBasket from 'api/baskets/useUpdateBasket';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

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

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import FormattedBudget from 'utils/currency/FormattedBudget';

// styles
import styled, { useTheme } from 'styled-components';
import { fontSizes, colors, defaultCardStyle, media } from 'utils/styleUtils';

// typings
import { ScreenReaderOnly } from 'utils/a11y';
import PBExpenses from 'containers/ProjectsShowPage/shared/pb/PBExpenses';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { BasketIdeaAttributes } from 'api/baskets/types';
import usePhase from 'api/phases/usePhase';

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
  phaseId?: string;
}

const timeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const AssignBudgetControl = memo(
  ({ view, ideaId, className, projectId, phaseId }: Props) => {
    const { data: authUser } = useAuthUser();
    const { data: idea } = useIdeaById(ideaId);
    const { data: project } = useProjectById(projectId);
    const { data: phase } = usePhase(phaseId);
    const { mutateAsync: addBasket } = useAddBasket(projectId);
    const { mutateAsync: updateBasket } = useUpdateBasket();
    const { data: appConfig } = useAppConfiguration();
    const theme = useTheme();

    const latestRelevantIdeaPhase = phase?.data;

    const isContinuousProject =
      project?.data.attributes.process_type === 'continuous';

    const participationContext = isContinuousProject
      ? project.data
      : latestRelevantIdeaPhase;

    const participationContextType = isContinuousProject ? 'project' : 'phase';
    const participationContextId = participationContext?.id || null;

    const { data: basket } = useBasket(
      participationContext?.relationships?.user_basket?.data?.id
    );
    const maxBudget = participationContext?.attributes.voting_max_total;
    const ideaBudget = idea?.data.attributes.budget;
    const basketTotal = basket?.data.attributes.total_votes;

    const [processing, setProcessing] = useState(false);

    if (
      isNilOrError(idea) ||
      !idea.data.attributes.budget ||
      !participationContextId
    ) {
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
            const basketIdeasAttributes: BasketIdeaAttributes = newIdeas.map(
              (ideaId) => ({
                idea_id: ideaId,
                votes: 10,
              })
            );

            await updateBasket({
              id: basket.data.id,
              submitted: false,
              baskets_ideas_attributes: basketIdeasAttributes,
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
            participation_context_id: participationContextId,
            participation_context_type: capitalizeParticipationContextType(
              participationContextType
            ),
            submitted: false,
            baskets_ideas_attributes: [{ idea_id: idea.data.id }],
          });

          // TODO: Remove the invalidations here after the basket data fetching PR by Iva is merged
          queryClient.invalidateQueries({
            queryKey: projectsKeys.item({ id: projectId }),
          });
          queryClient.invalidateQueries({
            queryKey: phasesKeys.list({ projectId }),
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
      !isNilOrError(basket?.data.attributes.submitted_at) ||
      (actionDescriptor.enabled === false &&
        !isFixableByAuthentication(actionDescriptor.disabled_reason));

    const buttonMessage = getAddRemoveButtonMessage(view, isInBasket);

    const addRemoveButton = buttonVisible ? (
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
        {` (${
          idea.data.attributes.budget
        } ${appConfig?.data.attributes.settings.core.currency.toString()})`}
      </Button>
    ) : null;

    if (view === 'ideaCard') {
      return (
        <Box className={`e2e-assign-budget ${className || ''}`} width="100%">
          {addRemoveButton}
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
