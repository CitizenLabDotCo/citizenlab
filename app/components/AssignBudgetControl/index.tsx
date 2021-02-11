import React, { PureComponent, FormEvent } from 'react';
import { adopt } from 'react-adopt';
import { includes, isUndefined, get } from 'lodash-es';
import {
  isNilOrError,
  capitalizeParticipationContextType,
} from 'utils/helperUtils';

// typings
import { IParticipationContextType } from 'typings';

// components
import Button from 'components/UI/Button';
import Tippy from '@tippyjs/react';
import { Icon } from 'cl2-component-library';
import AssignBudgetDisabled from 'components/AssignBudgetControl/AssignBudgetDisabled';

// services
import { addBasket, updateBasket } from 'services/baskets';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfiguration, { GetTenantChildProps } from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetBasket, { GetBasketChildProps } from 'resources/GetBasket';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from 'containers/ProjectsShowPage/shared/pb/tracks';

// utils
import streams from 'utils/streams';
import { pastPresentOrFuture } from 'utils/dateUtils';
import clHistory from 'utils/cl-router/history';
import { openSignUpInModal } from 'components/SignUpIn/events';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { FormattedNumber, InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import PBExpenses from 'containers/ProjectsShowPage/shared/pb/PBExpenses';
import { darken } from 'polished';

const IdeaCardContainer = styled.div`
  display: flex;
  align-items: center;
`;

const IdeaPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const BudgetBox = styled.div`
  background-color: white;
  width: 100%;
  height: 95px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  position: relative;
  border: solid 1px ${colors.separation};
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

const Budget = styled.div`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.large}px;
  font-weight: 500;
`;

const ButtonWrapper = styled.div``;

const TooltipContent = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
`;

const IdeaCardButton = styled(Button)``;

const AssignedContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
`;

const ControlWrapperHorizontalRule = styled.hr`
  width: 100%;
  border: none;
  height: 1px;
  background-color: ${colors.separation};
  margin: 20px 0;
`;

const AssignedIcon = styled(Icon)`
  height: 39px;
  color: ${colors.adminTextColor};
  margin-right: 15px;
  margin-bottom: 10px;
`;

const AssignedText = styled.div`
  color: ${colors.clGreenSuccess};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  hyphens: auto;
`;

const ActionsWrapper = styled.div`
  margin-top: 5px;
  display: flex;
  color: ${colors.label};
`;

const Separator = styled.div`
  font-size: ${fontSizes.xs}px;
  margin-left: 10px;
  margin-right: 10px;
`;

const ActionButton = styled.button`
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  text-decoration: underline;
  padding: 0;
  margin: 0;
  cursor: pointer;

  &:hover,
  &:focus {
    color: ${darken(0.5, colors.label)};
  }
`;

interface InputProps {
  view: 'ideaCard' | 'ideaPage';
  ideaId: string;
  participationContextId: string;
  participationContextType: IParticipationContextType;
  openIdea?: (event: FormEvent<any>) => void;
  disabledAssignBudgetClick?: () => void;
  className?: string;
  projectId: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
  locale: GetLocaleChildProps;
  idea: GetIdeaChildProps;
  basket: GetBasketChildProps;
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
}

interface Tracks {
  basketCreated: () => void;
  ideaRemovedFromBasket: () => void;
  ideaAddedToBasket: () => void;
  basketSubmitted: () => void;
  disabledAssignClick: () => void;
}

interface Props extends DataProps, InputProps {}

interface State {
  processing: boolean;
}

class AssignBudgetControl extends PureComponent<
  Props & Tracks & InjectedIntlProps,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
    };
  }

  isDisabled = () => {
    const { participationContextType, project, phase } = this.props;

    if (
      participationContextType === 'phase' &&
      !isNilOrError(phase) &&
      pastPresentOrFuture([
        phase.attributes.start_at,
        phase.attributes.end_at,
      ]) === 'present'
    ) {
      return false;
    } else if (
      participationContextType === 'project' &&
      !isNilOrError(project) &&
      project.attributes.publication_status !== 'archived'
    ) {
      return false;
    }

    return true;
  };

  assignBudget = async (event?: FormEvent<any>) => {
    event?.preventDefault();
    event?.stopPropagation();

    const timeout = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const done = async () => {
      await timeout(200);
      this.setState({ processing: false });
    };

    if (!isNilOrError(this.props.idea)) {
      const {
        ideaId,
        idea,
        authUser,
        basket,
        participationContextId,
        participationContextType,
        disabledAssignBudgetClick,
      } = this.props;
      const budgetingEnabled =
        idea.attributes.action_descriptor.budgeting?.enabled;
      const budgetingDisabledReason =
        idea.attributes.action_descriptor.budgeting?.disabled_reason;
      const basketIdeaIds = !isNilOrError(basket)
        ? basket.relationships.ideas.data.map((idea) => idea.id)
        : [];
      const isInBasket = includes(basketIdeaIds, ideaId);

      if (
        isNilOrError(authUser) &&
        (budgetingDisabledReason === 'not_signed_in' ||
          budgetingDisabledReason === 'not_verified')
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
      } else if (!budgetingEnabled && disabledAssignBudgetClick) {
        disabledAssignBudgetClick();
      } else if (!isNilOrError(authUser) && budgetingEnabled) {
        this.setState({ processing: true });

        if (!isNilOrError(basket)) {
          let newIdeas: string[] = [];

          if (isInBasket) {
            newIdeas = basket.relationships.ideas.data
              .filter((basketIdea) => {
                return basketIdea.id !== idea.id;
              })
              .map((basketIdea) => {
                return basketIdea.id;
              });
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
            this.props.ideaAddedToBasket();
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
            this.props.basketCreated();
          } catch (error) {
            done();
          }
        }
      }
    }
  };

  onCardClick = (event: FormEvent<any>) => {
    this.props.openIdea && this.props.openIdea(event);
  };

  goBack = () => {
    const { project, participationContextType } = this.props;
    if (!isNilOrError(project)) {
      clHistory.push(
        `/projects/${project.attributes.slug}/${
          participationContextType === 'project' ? 'ideas' : 'process'
        }`
      );
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
      const disabled = this.isDisabled();
      const fullClassName = `e2e-assign-budget ${className}`;

      if (view === 'ideaCard') {
        const budgetingEnabled =
          idea.attributes.action_descriptor.budgeting?.enabled;
        const budgetingDisabledReason =
          idea.attributes.action_descriptor.budgeting?.disabled_reason;
        const budgetingDescriptor = idea.attributes.action_descriptor.budgeting;

        const tippyContent =
          !!authUser && !budgetingEnabled && !!budgetingDisabledReason ? (
            <TooltipContent
              id="tooltip-content"
              className="e2e-disabled-tooltip"
            >
              <AssignBudgetDisabled
                budgetingDescriptor={budgetingDescriptor}
                participationContextId={participationContextId}
                participationContextType={participationContextType}
              />
            </TooltipContent>
          ) : null;

        return (
          <IdeaCardContainer className={fullClassName} aria-live="polite">
            <Tippy
              disabled={!tippyContent}
              interactive={true}
              placement="bottom"
              content={tippyContent || <></>}
              theme="light"
              hideOnClick={false}
            >
              <ButtonWrapper tabIndex={!budgetingEnabled ? 0 : -1}>
                <IdeaCardButton
                  onClick={this.assignBudget}
                  disabled={!!authUser && !budgetingEnabled}
                  processing={processing}
                  bgColor={
                    isInBasket
                      ? colors.adminSecondaryTextColor
                      : colors.adminTextColor
                  }
                  iconSize="18px"
                  icon={!isInBasket ? 'basket-plus' : 'remove'}
                  className={`e2e-assign-budget-button ${
                    isInBasket ? 'in-basket' : 'not-in-basket'
                  }`}
                  ariaLabel={
                    !isInBasket
                      ? formatMessage(messages.assign)
                      : formatMessage(messages.undo)
                  }
                />
              </ButtonWrapper>
            </Tippy>
          </IdeaCardContainer>
        );
      } else if (view === 'ideaPage') {
        return (
          <IdeaPageContainer className={fullClassName} aria-live="polite">
            {isInBasket && !processing ? (
              <>
                <AssignedContainer>
                  <AssignedIcon ariaHidden name="basket-checkmark" />
                  <AssignedText>
                    <FormattedMessage {...messages.assigned} />
                  </AssignedText>
                </AssignedContainer>
                <ActionsWrapper>
                  <ActionButton onClick={this.assignBudget}>
                    <FormattedMessage {...messages.undo} />
                  </ActionButton>
                  <Separator aria-hidden>•</Separator>
                  <ActionButton onClick={this.goBack}>
                    <FormattedMessage {...messages.backToOverview} />
                  </ActionButton>
                </ActionsWrapper>
              </>
            ) : (
              <>
                <Budget>
                  <ScreenReaderOnly>
                    <FormattedMessage {...messages.a11y_price} />
                  </ScreenReaderOnly>
                  <BudgetBox>
                    <FormattedNumber
                      value={idea.attributes.budget}
                      style="currency"
                      currency={tenant.attributes.settings.core.currency}
                      minimumFractionDigits={0}
                      maximumFractionDigits={0}
                    />
                  </BudgetBox>
                </Budget>
                <Button
                  onClick={this.assignBudget}
                  processing={processing}
                  bgColor={
                    disabled
                      ? colors.disabledPrimaryButtonBg
                      : isInBasket
                      ? colors.adminSecondaryTextColor
                      : colors.adminTextColor
                  }
                  bgHoverColor={
                    disabled ? colors.disabledPrimaryButtonBg : undefined
                  }
                  icon="basket-plus"
                  fullWidth={true}
                  iconAriaHidden
                >
                  <FormattedMessage {...messages.assign} />
                </Button>
              </>
            )}
            <ControlWrapperHorizontalRule aria-hidden />
            <PBExpenses
              participationContextId={participationContextId}
              participationContextType={participationContextType}
              viewMode="column"
            />
          </IdeaPageContainer>
        );
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
      basketId =
        !isNilOrError(project) && project.relationships.user_basket
          ? get(project.relationships.user_basket.data, 'id', null)
          : null;
    } else {
      basketId =
        !isNilOrError(phase) && phase.relationships.user_basket
          ? get(phase.relationships.user_basket.data, 'id', null)
          : null;
    }

    return <GetBasket id={basketId}>{render}</GetBasket>;
  },
});

const AssignBudgetControlWithHoCs = injectIntl(
  injectTracks<Props>({
    basketCreated: tracks.basketCreated,
    ideaRemovedFromBasket: tracks.ideaRemovedFromBasket,
    ideaAddedToBasket: tracks.ideaAddedToBasket,
    basketSubmitted: tracks.basketSubmitted,
    disabledAssignClick: tracks.disabledAssignClick,
  })(AssignBudgetControl)
);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <AssignBudgetControlWithHoCs {...inputProps} {...dataProps} />
    )}
  </Data>
);
