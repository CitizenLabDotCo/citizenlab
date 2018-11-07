import React, { PureComponent, FormEvent } from 'react';
import { adopt } from 'react-adopt';
import { includes, isUndefined } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';

// services
import { addBasket, updateBasket } from 'services/baskets';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetBasket, { GetBasketChildProps } from 'resources/GetBasket';

// utils
import streams from 'utils/streams';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// typings
import { ParticipationMethod } from 'services/participationContexts';

const Container = styled.div`
  display: flex;
  align-items: center;
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
  ideaId: string;
  basketId: string | null | undefined;
  participationMethod: ParticipationMethod;
  participationContextId: string;
  participationContextType: 'Phase' | 'Project';
  openIdea: (event: FormEvent<any>) => void;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  idea: GetIdeaChildProps;
  basket: GetBasketChildProps;
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

  assignBudget = async (event: FormEvent<any>) => {
    event.preventDefault();
    event.stopPropagation();

    const { ideaId, idea, authUser, basket, participationMethod, participationContextId, participationContextType } = this.props;
    const basketIdeaIds = (!isNilOrError(basket) ? basket.relationships.ideas.data.map(idea => idea.id) : []);
    const isInBasket = includes(basketIdeaIds, ideaId);

    if (participationMethod === 'budgeting' && !isNilOrError(idea) && !isNilOrError(authUser)) {
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
    this.props.openIdea(event);
  }

  render () {
    const { processing } = this.state;
    const { ideaId, authUser, idea, basket, className } = this.props;

    if (!isNilOrError(authUser) && !isNilOrError(idea) && !isUndefined(basket)) {
      const budgetExceedsLimit = (!isNilOrError(basket) ? basket.attributes['budget_exceeds_limit?'] as boolean : false);
      const basketIdeaIds = (!isNilOrError(basket) ? basket.relationships.ideas.data.map(idea => idea.id) : []);
      const isInBasket = includes(basketIdeaIds, ideaId);

      return (
        <Container className={className}>
          <Button
            onClick={this.assignBudget}
            processing={processing}
            bgColor={isInBasket ? colors.adminSecondaryTextColor : undefined}
            disabled={budgetExceedsLimit && !isInBasket}
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
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  basket: ({ basketId, render }) => <GetBasket id={basketId}>{render}</GetBasket>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <AssignBudgetControl {...inputProps} {...dataProps} />}
  </Data>
);
