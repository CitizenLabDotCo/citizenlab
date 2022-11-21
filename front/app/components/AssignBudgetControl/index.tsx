import React, { memo, FormEvent, useState } from 'react';
import { includes, isUndefined } from 'lodash-es';
import {
  isNilOrError,
  capitalizeParticipationContextType,
} from 'utils/helperUtils';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

// components
import Button from 'components/UI/Button';

// services
import { IProjectData } from 'services/projects';
import { getCurrentPhase, getLatestRelevantPhase } from 'services/phases';
import { addBasket, updateBasket } from 'services/baskets';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useIdea from 'hooks/useIdea';
import useBasket from 'hooks/useBasket';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'containers/ProjectsShowPage/shared/pb/tracks';

// utils
import streams from 'utils/streams';
import { openSignUpInModal } from 'components/SignUpIn/events';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import FormattedBudget from 'utils/currency/FormattedBudget';

// styles
import styled from 'styled-components';
import { fontSizes, colors, defaultCardStyle, media } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import PBExpenses from 'containers/ProjectsShowPage/shared/pb/PBExpenses';
import { IIdeaData } from 'services/ideas';
import { IUserData } from 'services/users';

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
  color: ${(props: any) => props.theme.colors.tenantText};
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
    const idea = useIdea({ ideaId });
    const project = useProject({ projectId });
    const phases = usePhases(projectId);
    const isContinuousProject =
      project?.attributes.process_type === 'continuous';
    const ideaPhaseIds = !isNilOrError(idea)
      ? idea?.relationships?.phases?.data?.map((item) => item.id)
      : null;
    const ideaPhases = !isNilOrError(phases)
      ? phases?.filter((phase) => includes(ideaPhaseIds, phase.id))
      : null;
    const latestRelevantIdeaPhase = ideaPhases
      ? getLatestRelevantPhase(ideaPhases)
      : null;
    const participationContext = isContinuousProject
      ? project
      : latestRelevantIdeaPhase;
    const participationContextType = isContinuousProject ? 'project' : 'phase';
    const participationContextId = participationContext?.id || null;
    const basket = useBasket(
      participationContext?.relationships?.user_basket?.data?.id
    );

    const [processing, setProcessing] = useState(false);

    const handleAddRemoveButtonClick =
      (idea: IIdeaData, participationContextId: string) =>
      (event?: FormEvent) => {
        event?.preventDefault();
        assignBudget(idea, participationContextId);
      };

    const assignBudget = async (
      idea: IIdeaData,
      participationContextId: string
    ) => {
      const isBudgetingEnabled =
        idea.attributes.action_descriptor.budgeting?.enabled;
      const budgetingDisabledReason =
        idea.attributes.action_descriptor.budgeting?.disabled_reason;

      if (
        isNilOrError(authUser) ||
        budgetingDisabledReason === 'not_signed_in'
      ) {
        openSignUpInModal({
          // This never works because 'not_signed_in' gets precedence in the BE
          // as a disabled_reason.
          // Even when set to true,
          // it doesn't work.
          verification: budgetingDisabledReason === 'not_verified',
          verificationContext:
            budgetingDisabledReason === 'not_verified'
              ? {
                  action: 'budgeting',
                  id: participationContextId,
                  type: participationContextType,
                }
              : undefined,
        });
      } else if (
        !isNilOrError(authUser) &&
        budgetingDisabledReason === 'not_verified'
      ) {
        openVerificationModal({
          context: {
            action: 'budgeting',
            id: participationContextId,
            type: participationContextType,
          },
        });
      } else if (isBudgetingEnabled) {
        actuallyAssignBudget(idea, participationContextId, authUser);
      }
    };

    const actuallyAssignBudget = async (
      idea: IIdeaData,
      participationContextId: string,
      authUser: IUserData
    ) => {
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
        const isInBasket = includes(basketIdeaIds, ideaId);
        let newIdeas: string[] = [];

        if (isInBasket) {
          newIdeas = basket.relationships.ideas.data
            .filter((basketIdea) => basketIdea.id !== idea.id)
            .map((basketIdea) => basketIdea.id);
        } else {
          newIdeas = [
            ...basket.relationships.ideas.data.map(
              (basketIdea) => basketIdea.id
            ),
            idea.id,
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
            idea_ids: [idea.id],
          });
          done();
          trackEventByName(tracks.basketCreated);
        } catch (error) {
          done();
        }
      }
    };

    if (
      !isNilOrError(idea) &&
      !isUndefined(basket) &&
      idea.attributes.budget &&
      participationContextId
    ) {
      const basketIdeaIds = !isNilOrError(basket)
        ? basket.relationships.ideas.data.map((idea) => idea.id)
        : [];
      const isInBasket = includes(basketIdeaIds, ideaId);
      const isBudgetingEnabled =
        idea.attributes.action_descriptor.budgeting?.enabled;
      const isSignedIn = !isNilOrError(authUser);
      const budgetingDisabledReason =
        idea.attributes.action_descriptor.budgeting?.disabled_reason;
      const isPermitted = budgetingDisabledReason !== 'not_permitted';
      const hasBudgetingDisabledReason =
        !!idea.attributes.action_descriptor.budgeting?.disabled_reason;
      const isPBContext =
        participationContext?.attributes?.participation_method === 'budgeting';
      const isCurrentPhase =
        getCurrentPhase(phases)?.id === participationContext?.id;
      const isCurrent =
        (participationContextType === 'project' &&
          (participationContext as IProjectData).attributes
            .publication_status !== 'archived') ||
        isCurrentPhase;

      const getAddRemoveButtonMessage = (view: TView) => {
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
      };

      if (isPBContext) {
        const addRemoveButton =
          isCurrent && isPermitted ? (
            <Button
              onClick={handleAddRemoveButtonClick(idea, participationContextId)}
              disabled={
                isSignedIn && !isBudgetingEnabled && !hasBudgetingDisabledReason
              }
              processing={processing}
              bgColor={isInBasket ? colors.red600 : colors.success}
              icon={!isInBasket ? 'basket-plus' : 'basket-minus'}
              className={`e2e-assign-budget-button ${
                isInBasket ? 'in-basket' : 'not-in-basket'
              }`}
            >
              <FormattedMessage {...getAddRemoveButtonMessage(view)} />
            </Button>
          ) : null;

        if (view === 'ideaCard') {
          return (
            <IdeaCardContainer
              className={`e2e-assign-budget ${className || ''}`}
            >
              {addRemoveButton}
            </IdeaCardContainer>
          );
        }

        if (view === 'ideaPage') {
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
                  <FormattedBudget value={idea.attributes.budget} />
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
      }
    }

    return null;
  }
);

export default AssignBudgetControl;
