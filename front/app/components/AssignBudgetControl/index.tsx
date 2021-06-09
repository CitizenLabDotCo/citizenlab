import React, { PureComponent, FormEvent } from 'react';
import { adopt } from 'react-adopt';
import { includes, isUndefined } from 'lodash-es';
import {
  isNilOrError,
  capitalizeParticipationContextType,
} from 'utils/helperUtils';

// typings
import { IParticipationContextType } from 'typings';

// components
import Button from 'components/UI/Button';

// services
import { getCurrentPhase } from 'services/phases';
import { addBasket, updateBasket } from 'services/baskets';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetBasket, { GetBasketChildProps } from 'resources/GetBasket';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'containers/ProjectsShowPage/shared/pb/tracks';

// utils
import streams from 'utils/streams';
import { openSignUpInModal } from 'components/SignUpIn/events';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { FormattedNumber, InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styles
import styled from 'styled-components';
import { fontSizes, colors, defaultCardStyle, media } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import PBExpenses from 'containers/ProjectsShowPage/shared/pb/PBExpenses';

const IdeaCardContainer = styled.div`
  display: flex;
  align-items: center;
`;

const IdeaPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  ${media.smallerThanMaxTablet`
    padding: 20px;
    background: ${colors.backgroundLightGrey};
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
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.medium}px;
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

interface InputProps {
  view: 'ideaCard' | 'ideaPage';
  projectId: string;
  ideaId: string;
  participationContextId: string;
  participationContextType: IParticipationContextType;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetAppConfigurationChildProps;
  locale: GetLocaleChildProps;
  idea: GetIdeaChildProps;
  basket: GetBasketChildProps;
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
  phase: GetPhaseChildProps;
}

interface Props extends DataProps, InputProps {}

interface State {
  processing: boolean;
}

class AssignBudgetControl extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
    };
  }

  assignBudget = async (event?: FormEvent<any>) => {
    event?.preventDefault();
    event?.stopPropagation();

    const timeout = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const done = async () => {
      await timeout(200);
      this.setState({ processing: false });
    };

    const { idea } = this.props;

    if (!isNilOrError(idea)) {
      const {
        ideaId,
        authUser,
        basket,
        participationContextId,
        participationContextType,
      } = this.props;
      const budgetingEnabled =
        idea.attributes.action_descriptor.budgeting?.enabled;
      const basketIdeaIds = !isNilOrError(basket)
        ? basket.relationships.ideas.data.map((idea) => idea.id)
        : [];
      const isInBasket = includes(basketIdeaIds, ideaId);
      const budgetingDisabledReason =
        idea.attributes.action_descriptor.budgeting?.disabled_reason;

      if (
        isNilOrError(authUser) ||
        budgetingDisabledReason === 'not_verified'
      ) {
        openSignUpInModal({
          verification: budgetingDisabledReason === 'not_verified',
          verificationContext:
            budgetingDisabledReason === 'not_verified'
              ? {
                  action: 'budgeting',
                  id: participationContextId,
                  type: participationContextType,
                }
              : undefined,
          action: () => this.assignBudget(),
        });
      } else if (!isNilOrError(authUser) && budgetingEnabled) {
        this.setState({ processing: true });

        if (!isNilOrError(basket)) {
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
      }
    }
  };

  render() {
    const { processing } = this.state;
    const {
      view,
      ideaId,
      authUser,
      locale,
      tenant,
      idea,
      basket,
      className,
      participationContextId,
      participationContextType,
      project,
      phases,
      phase,
      intl: { formatMessage },
    } = this.props;

    if (
      !isUndefined(authUser) &&
      !isNilOrError(locale) &&
      !isNilOrError(tenant) &&
      !isNilOrError(idea) &&
      !isUndefined(basket) &&
      idea.attributes.budget
    ) {
      const basketIdeaIds = !isNilOrError(basket)
        ? basket.relationships.ideas.data.map((idea) => idea.id)
        : [];
      const isInBasket = includes(basketIdeaIds, ideaId);
      const isBudgetingEnabled =
        idea.attributes.action_descriptor.budgeting?.enabled;
      const isSignedIn = !!authUser;
      const budgetingDisabledReason =
        idea.attributes.action_descriptor.budgeting?.disabled_reason;
      const isPermitted = budgetingDisabledReason !== 'not_permitted';
      const hasBudgetingDisabledReason = !!idea.attributes.action_descriptor
        .budgeting?.disabled_reason;
      const isPBProject =
        !isNilOrError(project) &&
        project.attributes.process_type === 'continuous' &&
        project.attributes.participation_method === 'budgeting';
      const isPBPhase =
        !isNilOrError(project) &&
        !isNilOrError(phase) &&
        project.attributes.process_type === 'timeline' &&
        phase.attributes.participation_method === 'budgeting';
      const currentPhase = getCurrentPhase(phases);
      const isCurrentPhase = currentPhase?.id === phase?.id;
      const isPBProjectOrPBPhase = isPBProject || isPBPhase;
      const isPBProjectOrPBCurrentPhase =
        isPBProject || (isPBPhase && isCurrentPhase);

      if (isPBProjectOrPBPhase) {
        const addRemoveButton =
          isPBProjectOrPBCurrentPhase && isPermitted ? (
            <Button
              onClick={this.assignBudget}
              disabled={
                isSignedIn && !isBudgetingEnabled && !hasBudgetingDisabledReason
              }
              processing={processing}
              bgColor={isInBasket ? colors.clRedError : colors.clGreen}
              iconSize="18px"
              icon={!isInBasket ? 'basket-plus' : 'basket-minus'}
              className={`e2e-assign-budget-button ${
                isInBasket ? 'in-basket' : 'not-in-basket'
              }`}
              ariaLabel={formatMessage(
                !isInBasket
                  ? messages.addToMyExpenses
                  : messages.removeFromMyExpenses
              )}
            >
              <FormattedMessage
                {...(!isInBasket
                  ? view === 'ideaCard'
                    ? messages.add
                    : messages.addToMyExpenses
                  : view === 'ideaCard'
                  ? messages.remove
                  : messages.removeFromMyExpenses)}
              />
            </Button>
          ) : null;

        if (view === 'ideaCard') {
          return (
            <IdeaCardContainer
              className={`e2e-assign-budget ${className || ''}`}
              aria-live="polite"
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
              aria-live="polite"
            >
              <BudgetWithButtonWrapper>
                <Budget>
                  <ScreenReaderOnly>
                    <FormattedMessage {...messages.a11y_price} />
                  </ScreenReaderOnly>
                  <FormattedNumber
                    value={idea.attributes.budget}
                    style="currency"
                    currency={tenant.attributes.settings.core.currency}
                    minimumFractionDigits={0}
                    maximumFractionDigits={0}
                  />
                </Budget>
                {addRemoveButton}
              </BudgetWithButtonWrapper>
              {isPBProjectOrPBPhase && isPermitted && (
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
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  tenant: <GetAppConfiguration />,
  locale: <GetLocale />,
  idea: ({ ideaId, render }) => <GetIdea ideaId={ideaId}>{render}</GetIdea>,
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  phases: ({ project, render }) => {
    return (
      <GetPhases projectId={!isNilOrError(project) ? project.id : null}>
        {render}
      </GetPhases>
    );
  },
  phase: ({ participationContextType, participationContextId, render }) => (
    <GetPhase
      id={participationContextType === 'phase' ? participationContextId : null}
    >
      {render}
    </GetPhase>
  ),
  basket: ({ project, phase, participationContextType, render }) => {
    let basketId: string | null = null;

    if (participationContextType === 'project') {
      basketId = !isNilOrError(project)
        ? project.relationships?.user_basket?.data?.id || null
        : null;
    } else {
      basketId = !isNilOrError(phase)
        ? phase.relationships?.user_basket?.data?.id || null
        : null;
    }

    return <GetBasket id={basketId}>{render}</GetBasket>;
  },
});

const AssignBudgetControlWithHoCs = injectIntl(AssignBudgetControl);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <AssignBudgetControlWithHoCs {...inputProps} {...dataProps} />
    )}
  </Data>
);
