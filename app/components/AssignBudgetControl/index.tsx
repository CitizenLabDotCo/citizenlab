import React, { PureComponent, FormEvent } from 'react';
import { adopt } from 'react-adopt';
import { includes, isUndefined } from 'lodash-es';
import { isNilOrError, getFormattedBudget } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';

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

// utils
import streams from 'utils/streams';
import { pastPresentOrFuture } from 'utils/dateUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
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

const Budget = styled.div`
  width: 100%;
  height: 95px;
  color: ${colors.adminSecondaryTextColor};
  font-size: ${fontSizes.large}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  background: ${colors.background};
  border: solid 1px ${colors.separation};
`;

const SeeIdeaButton = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  padding: 0;
  padding-left: 14px;

  &:hover {
    color: #000;
  }
`;

interface InputProps {
  view: 'ideaCard' | 'ideaPage';
  ideaId: string;
  basketId: string | null | undefined;
  participationContextId: string;
  participationContextType: 'Phase' | 'Project';
  openIdea?: (event: FormEvent<any>) => void;
  unauthenticatedVoteClick?: () => void;
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

interface Props extends DataProps, InputProps {}

interface State {
  processing: boolean;
}

class AssignBudgetControl extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      processing: false
    };
  }

  isDisabled = () => {
    const { ideaId, participationContextType, basket, project, phase } = this.props;
    const budgetExceedsLimit = (!isNilOrError(basket) ? basket.attributes['budget_exceeds_limit?'] as boolean : false);
    const basketIdeaIds = (!isNilOrError(basket) ? basket.relationships.ideas.data.map(idea => idea.id) : []);
    const isInBasket = includes(basketIdeaIds, ideaId);

    if (budgetExceedsLimit && !isInBasket) {
      return true;
    } else if (participationContextType === 'Phase' && !isNilOrError(phase) && pastPresentOrFuture([phase.attributes.start_at, phase.attributes.end_at]) === 'present') {
      return false;
    } else if (participationContextType === 'Project' && !isNilOrError(project) && project.attributes.publication_status !== 'archived') {
      return false;
    }

    return true;
  }

  assignBudget = async (event: FormEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();

    const { ideaId, idea, authUser, basket, participationContextId, participationContextType, unauthenticatedVoteClick } = this.props;
    const basketIdeaIds = (!isNilOrError(basket) ? basket.relationships.ideas.data.map(idea => idea.id) : []);
    const isInBasket = includes(basketIdeaIds, ideaId);

    if (!authUser) {
      unauthenticatedVoteClick && unauthenticatedVoteClick();
    } else if (!isNilOrError(idea) && !isNilOrError(authUser)) {
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
            idea_ids: newIdeas
          });
        } catch (error) {
          streams.fetchAllWith({ dataId: [basket.id] });
          this.setState({ processing: false });
        }
      } else {
        try {
          await addBasket({
            user_id: authUser.id,
            participation_context_id: participationContextId,
            participation_context_type: participationContextType,
            idea_ids: [idea.id]
          });
        } catch (error) {
          this.setState({ processing: false });
        }
      }

      this.setState({ processing: false });
    }
  }

  onCardClick = (event: FormEvent<any>) => {
    this.props.openIdea && this.props.openIdea(event);
  }

  render () {
    const { processing } = this.state;
    const { view, ideaId, authUser, locale, tenant, idea, basket, className } = this.props;

    if (!isUndefined(authUser) &&
        !isNilOrError(locale) &&
        !isNilOrError(tenant) &&
        !isNilOrError(idea) &&
        !isUndefined(basket) &&
        idea.attributes.budget
    ) {
      const basketIdeaIds = (!isNilOrError(basket) ? basket.relationships.ideas.data.map(idea => idea.id) : []);
      const isInBasket = includes(basketIdeaIds, ideaId);
      const disabled = this.isDisabled();
      const formattedBudget = getFormattedBudget(locale, idea.attributes.budget, tenant.attributes.settings.core.currency);

      if (view === 'ideaCard') {
        return (
          <IdeaCardContainer className={className}>
            <Button
              onClick={this.assignBudget}
              processing={processing}
              bgColor={isInBasket ? colors.adminSecondaryTextColor : undefined}
              disabled={disabled}
            >
              {!isInBasket ? (
                <FormattedMessage {...messages.assign} />
              ) : (
                <FormattedMessage {...messages.undo} />
              )}
            </Button>
            <SeeIdeaButton onClick={this.onCardClick}>
              <FormattedMessage {...messages.seeIdea} />
            </SeeIdeaButton>
          </IdeaCardContainer>
        );
      } else if (view === 'ideaPage') {
        return (
          <IdeaPageContainer className={className}>
            <Budget>
              <span>{formattedBudget}</span>
            </Budget>
            <Button
              onClick={this.assignBudget}
              processing={processing}
              bgColor={isInBasket ? colors.adminSecondaryTextColor : undefined}
              disabled={disabled}
              fullWidth={true}
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
  basket: ({ basketId, render }) => <GetBasket id={basketId}>{render}</GetBasket>,
  project: ({ participationContextType, participationContextId, render }) => <GetProject id={participationContextType === 'Project' ? participationContextId : null}>{render}</GetProject>,
  phase: ({ participationContextType, participationContextId, render }) => <GetPhase id={participationContextType === 'Phase' ? participationContextId : null}>{render}</GetPhase>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AssignBudgetControl {...inputProps} {...dataProps} />}
  </Data>
);
