import React, { PureComponent, FormEvent } from 'react';
import { adopt } from 'react-adopt';
import { includes, isUndefined, get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';

// services
import { addBasket, updateBasket } from 'services/baskets';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetBasket, { GetBasketChildProps } from 'resources/GetBasket';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from 'containers/ProjectsShowPage/pb/tracks';

// utils
import streams from 'utils/streams';
import { pastPresentOrFuture } from 'utils/dateUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedNumber } from 'react-intl';
import messages from './messages';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

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
  width: 100%;
  height: 95px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  position: relative;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${colors.background};
  border: solid 1px ${colors.separation};
`;

const Budget = styled.div`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.large}px;
  font-weight: 500;
`;

const IdeaCardButton = styled(Button)`
  margin-right: 12px;
`;

const BudgetBoxAssigned = styled.div`
  margin-top: 12px;
`;

const AssignedLabel = styled.div`
  display: flex;
  align-items: center;
`;

const AssignedIcon = styled(Icon)`
  height: 12px;
  fill: ${colors.clGreenSuccess};
  margin-right: 4px;
`;

const AssignedText = styled.div`
  color: ${colors.clGreenSuccess};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  hyphens: auto;
`;

interface InputProps {
  view: 'ideaCard' | 'ideaPage';
  ideaId: string;
  participationContextId: string;
  participationContextType: 'Phase' | 'Project';
  openIdea?: (event: FormEvent<any>) => void;
  unauthenticatedAssignBudgetClick?: () => void;
  disabledAssignBudgetClick?: () => void;
  className?: string;
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
  unauthenticatedAssignClick: () => void;
  disabledAssignClick: () => void;
}

interface Props extends DataProps, InputProps {}

interface State {
  processing: boolean;
}

class AssignBudgetControl extends PureComponent<Props & Tracks, State> {
  constructor(props) {
    super(props);
    this.state = {
      processing: false
    };
  }

  isDisabled = () => {
    const { participationContextType, project, phase } = this.props;

    if (participationContextType === 'Phase' && !isNilOrError(phase) && pastPresentOrFuture([phase.attributes.start_at, phase.attributes.end_at]) === 'present') {
      return false;
    } else if (participationContextType === 'Project' && !isNilOrError(project) && project.attributes.publication_status !== 'archived') {
      return false;
    }

    return true;
  }

  assignBudget = async (event: FormEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();

    const { ideaId, idea, authUser, basket, participationContextId, participationContextType, unauthenticatedAssignBudgetClick, disabledAssignBudgetClick } = this.props;
    const basketIdeaIds = (!isNilOrError(basket) ? basket.relationships.ideas.data.map(idea => idea.id) : []);
    const isInBasket = includes(basketIdeaIds, ideaId);
    const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const done = async () => {
      await timeout(200);
      this.setState({ processing: false });
    };

    if (!authUser) {
      unauthenticatedAssignBudgetClick && unauthenticatedAssignBudgetClick();
      this.props.unauthenticatedAssignClick();
    } else if (!isNilOrError(idea) && !isNilOrError(authUser)) {
      const budgetingEnabled = get(idea.attributes.action_descriptor.data.budgeting, 'enabled', null);

      if (budgetingEnabled === false) {
        disabledAssignBudgetClick && disabledAssignBudgetClick();
        this.props.disabledAssignClick();
      } else {
        this.setState({ processing: true });

        if (!isNilOrError(basket)) {
          let newIdeas: string[] = [];

          if (isInBasket) {
            newIdeas = basket.relationships.ideas.data.filter((basketIdea) => {
              return basketIdea.id !== idea.id;
            }).map((basketIdea) => {
              return basketIdea.id;
            });
          } else {
            newIdeas = [
              ...basket.relationships.ideas.data.map(basketIdea => basketIdea.id),
              idea.id
            ];
          }

          try {
            await updateBasket(basket.id, {
              user_id: authUser.id,
              participation_context_id: participationContextId,
              participation_context_type: participationContextType,
              idea_ids: newIdeas,
              submitted_at: null
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
              participation_context_type: participationContextType,
              idea_ids: [idea.id]
            });
            done();
            this.props.basketCreated();
          } catch (error) {
            done();
          }
        }
      }
    }
  }

  onCardClick = (event: FormEvent<any>) => {
    this.props.openIdea && this.props.openIdea(event);
  }

  render () {
    const { processing } = this.state;
    const { view, ideaId, authUser, locale, tenant, idea, basket, className } = this.props;

    if (
      !isUndefined(authUser) &&
      !isNilOrError(locale) &&
      !isNilOrError(tenant) &&
      !isNilOrError(idea) &&
      !isUndefined(basket) &&
      idea.attributes.budget
    ) {
      const basketIdeaIds = (!isNilOrError(basket) ? basket.relationships.ideas.data.map(idea => idea.id) : []);
      const isInBasket = includes(basketIdeaIds, ideaId);
      const disabled = this.isDisabled();

      if (view === 'ideaCard') {
        return (
          <IdeaCardContainer className={className}>
            <IdeaCardButton
              onClick={this.assignBudget}
              processing={processing}
              bgColor={disabled ? colors.disabledPrimaryButtonBg : (isInBasket ? colors.adminSecondaryTextColor : colors.adminTextColor)}
              bgHoverColor={disabled ? colors.disabledPrimaryButtonBg : undefined}
              icon={!isInBasket ? 'add' : 'remove'}
            >
              {!isInBasket ? (
                <FormattedMessage {...messages.assign} />
              ) : (
                <FormattedMessage {...messages.undo} />
              )}
            </IdeaCardButton>
          </IdeaCardContainer>
        );
      } else if (view === 'ideaPage') {
        return (
          <IdeaPageContainer className={className}>
            <BudgetBox>
              <Budget>
                <FormattedNumber
                  value={idea.attributes.budget}
                  style="currency"
                  currency={tenant.attributes.settings.core.currency}
                  minimumFractionDigits={0}
                  maximumFractionDigits={0}
                />
              </Budget>
              {isInBasket && !processing &&
                <BudgetBoxAssigned>
                  <AssignedLabel>
                    <AssignedIcon name="checkmark" />
                    <AssignedText>
                      <FormattedMessage {...messages.assigned} />
                    </AssignedText>
                  </AssignedLabel>
                </BudgetBoxAssigned>
              }
            </BudgetBox>
            <Button
              onClick={this.assignBudget}
              processing={processing}
              bgColor={disabled ? colors.disabledPrimaryButtonBg : (isInBasket ? colors.adminSecondaryTextColor : colors.adminTextColor)}
              bgHoverColor={disabled ? colors.disabledPrimaryButtonBg : undefined}
              fullWidth={true}
              icon={!isInBasket ? 'add' : 'remove'}
            >
              {!isInBasket ? (
                <FormattedMessage {...messages.assign} />
              ) : (
                <FormattedMessage {...messages.undo} />
              )}
            </Button>
          </IdeaPageContainer>
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  tenant: <GetTenant />,
  locale: <GetLocale />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  project: ({ participationContextType, participationContextId, render }) => <GetProject id={participationContextType === 'Project' ? participationContextId : null}>{render}</GetProject>,
  phase: ({ participationContextType, participationContextId, render }) => <GetPhase id={participationContextType === 'Phase' ? participationContextId : null}>{render}</GetPhase>,
  basket: ({ project, phase, participationContextType, render }) => {
    let basketId: string | null = null;

    if (participationContextType === 'Project') {
      basketId = (!isNilOrError(project) ? get(project.relationships.user_basket.data, 'id', null) : null);
    } else {
      basketId = (!isNilOrError(phase) ? get(phase.relationships.user_basket.data, 'id', null) : null);
    }

    return <GetBasket id={basketId}>{render}</GetBasket>;
  }
});

const AssignBudgetControlWithHoCs = injectTracks<Props>({
  basketCreated: tracks.basketCreated,
  ideaRemovedFromBasket: tracks.ideaRemovedFromBasket,
  ideaAddedToBasket: tracks.ideaAddedToBasket,
  basketSubmitted: tracks.basketSubmitted,
  unauthenticatedAssignClick: tracks.unauthenticatedAssignClick,
  disabledAssignClick: tracks.disabledAssignClick
})(AssignBudgetControl);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AssignBudgetControlWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
