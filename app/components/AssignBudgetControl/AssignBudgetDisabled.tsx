import React, { PureComponent } from 'react';
import moment from 'moment';
import { adopt } from 'react-adopt';

// services
import { IIdeaData } from 'services/ideas';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

// styling
import styled from 'styled-components';
import { darken } from 'polished';
import { fontSizes, colors } from 'utils/styleUtils';

// typings
import { IParticipationContextType } from 'typings';

const Container = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  line-height: 20px;
`;

const StyledButton = styled.button`
  color: ${colors.clBlueDark};
  text-decoration: underline;
  transition: all 80ms ease-out;
  display: inline-block;
  margin: 0;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
    text-decoration: underline;
  }
`;

interface InputProps {
  budgetingDescriptor: IIdeaData['attributes']['action_descriptor']['budgeting'];
  participationContextId: string;
  participationContextType: IParticipationContextType;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class AssignBudgetDisabled extends PureComponent<Props, State> {
  onVerify = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const { participationContextId, participationContextType } = this.props;

    openVerificationModal({
      context: {
        action: 'budgeting',
        id: participationContextId,
        type: participationContextType,
      },
    });
  };

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  reasonToMessage = () => {
    const { budgetingDescriptor, authUser } = this.props;

    if (budgetingDescriptor) {
      const { disabled_reason, future_enabled } = budgetingDescriptor;

      if (disabled_reason && future_enabled) {
        return messages.budgetingFutureEnabled;
      } else if (authUser && disabled_reason === 'not_verified') {
        return messages.budgetingNotVerified;
      } else if (disabled_reason === 'not_permitted') {
        return messages.budgetingNotPermitted;
      }
    }

    return messages.budgetingNotPossible;
  };

  render() {
    const { budgetingDescriptor } = this.props;
    const enabledFromDate = budgetingDescriptor?.future_enabled
      ? moment(budgetingDescriptor.future_enabled).format('LL')
      : null;
    const verifyAccountLink = (
      <StyledButton onClick={this.onVerify} onMouseDown={this.removeFocus}>
        <FormattedMessage {...messages.verifyAccountLinkText} />
      </StyledButton>
    );
    const message = this.reasonToMessage();

    return (
      <Container className="e2e-assign-disabled">
        <FormattedMessage
          {...message}
          values={{ enabledFromDate, verifyAccountLink }}
        />
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <AssignBudgetDisabled {...inputProps} {...dataProps} />}
  </Data>
);
