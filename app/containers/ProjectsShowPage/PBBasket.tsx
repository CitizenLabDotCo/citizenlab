import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// resources
// import GetProject, { GetProjectChildProps } from 'resources/GetProject';
// import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetBasket, { GetBasketChildProps } from 'resources/GetBasket';

// styles
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div``;

const DropdownListItemText = styled.div`
  color: ${colors.adminTextColor};
  font-size: 17px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
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
  participationContextId: string;
  participationContextType: 'Project' | 'Phase';
  className?: string;
}

interface DataProps {
  // project: GetProjectChildProps;
  // phase: GetPhaseChildProps;
  basket: GetBasketChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class PBBasket extends PureComponent<Props, State> {
  confirmExpenses = () => {

  }

  render() {
    const { basket, className } = this.props;

    if (!isNilOrError(basket)) {

      console.log(basket);

      return (
        <Container className={className}>
          <DropdownListItem>
            <DropdownListItemText>Test</DropdownListItemText>
            <RemoveIcon name="remove" />
          </DropdownListItem>
          <DropdownListItem>
            <DropdownListItemText>Test</DropdownListItemText>
            <RemoveIcon name="remove" />
          </DropdownListItem>
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
  // project: ({ participationContextId, participationContextType, render }) => <GetProject id={participationContextType === 'Project' ? participationContextId : null}>{render}</GetProject>,
  // phase: ({ participationContextId, participationContextType, render }) => <GetPhase id={participationContextType === 'Phase' ? participationContextId : null}>{render}</GetPhase>,
  basket: ({ participationContextId, render }) => <GetBasket id={participationContextId}>{render}</GetBasket>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PBBasket {...inputProps} {...dataProps} />}
  </Data>
);
