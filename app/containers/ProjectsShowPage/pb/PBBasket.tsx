import React, { PureComponent, FormEvent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';

// services
import { updateBasket } from 'services/baskets';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetBasket, { GetBasketChildProps } from 'resources/GetBasket';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetIdeaList, { GetIdeaListChildProps } from 'resources/GetIdeaList';

// styles
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import T from 'components/T';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { IIdeaData } from 'services/ideas';

const Container = styled.div``;

const DropdownListItemText = styled.div`
  color: ${colors.adminTextColor};
  font-size: 17px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
`;

const RemoveIconWrapper = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RemoveIcon = styled(Icon)`
  height: 20px;
  fill: ${colors.clIconSecondary};
  cursor: pointer;

  &:hover {
    fill: ${colors.clRed};
  }
`;

const DropdownListItem = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
  background: #fff;
  border-radius: 5px;
  outline: none;

  &.last {
    margin-bottom: 0px;
  }
`;

const ConfirmExpensesButton = styled(Button)`
  margin-top: 10px;
`;

interface InputProps {
  participationContextId: string | null;
  participationContextType: 'Project' | 'Phase';
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  basket: GetBasketChildProps;
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
  ideaList: GetIdeaListChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class PBBasket extends PureComponent<Props, State> {
  removeIdeaFromBasket = (ideaIdToRemove: string) => (event: FormEvent<any>) => {
    event.preventDefault();

    const { authUser, basket, participationContextId, participationContextType } = this.props;

    if (!isNilOrError(basket) && !isNilOrError(authUser)) {
      const newIdeas = basket.relationships.ideas.data.filter(idea => idea.id !== ideaIdToRemove).map(idea => idea.id);

      updateBasket(basket.id, {
        user_id: authUser.id,
        participation_context_id: participationContextId,
        participation_context_type: participationContextType,
        idea_ids: newIdeas
      }).then((response) => {
        console.log('removeIdeaFromBasket succes');
        console.log(response);
      }).catch((error) => {
        console.log('removeIdeaFromBasket error');
        console.log(error);
      });
    }
  }

  confirmExpenses = () => {

  }

  render() {
    const { basket, ideaList, className } = this.props;

    if (!isNilOrError(basket)) {
      const ideas = (!isNilOrError(ideaList) ? ideaList.filter(idea => !isNilOrError(idea)) as IIdeaData[] : null);

      return (
        <Container className={className}>
          {ideas && ideas.length > 0 && ideas.map((idea) => (
            <DropdownListItem key={idea.id}>
              <DropdownListItemText>
                <T value={idea.attributes.title_multiloc} />
              </DropdownListItemText>
              <RemoveIconWrapper onClick={this.removeIdeaFromBasket(idea.id)}>
                <RemoveIcon name="remove" />
              </RemoveIconWrapper>
            </DropdownListItem>
          ))}
          <ConfirmExpensesButton
            className="e2e-dropdown-submit"
            style="admin-dark"
            icon="submit"
            iconPos="right"
            onClick={this.confirmExpenses}
            fullWidth={true}
            disabled={false}
          >
            <FormattedMessage {...messages.submitMyExpenses} />
          </ConfirmExpensesButton>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  project: ({ participationContextType, participationContextId, render }) => <GetProject id={participationContextType === 'Project' ? participationContextId : null}>{render}</GetProject>,
  phase: ({ participationContextType, participationContextId, render }) => <GetPhase id={participationContextType === 'Phase' ? participationContextId : null}>{render}</GetPhase>,
  basket: ({ participationContextType, project, phase, render }) => {
    let basketId: string | null = null;

    if (participationContextType === 'Project') {
      basketId = (!isNilOrError(project) ? get(project.relationships.user_basket.data, 'id', null) : null);
    } else {
      basketId = (!isNilOrError(phase) ? get(phase.relationships.user_basket.data, 'id', null) : null);
    }

    return <GetBasket id={basketId}>{render}</GetBasket>;
  },
  ideaList: ({ basket, render }) => <GetIdeaList ids={!isNilOrError(basket) ? basket.relationships.ideas.data.map(idea => idea.id) : null} >{render}</GetIdeaList>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PBBasket {...inputProps} {...dataProps} />}
  </Data>
);
