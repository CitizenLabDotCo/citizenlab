import React, { PureComponent } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import { darken } from 'polished';
import { FormattedMessage } from 'utils/cl-intl';
import { IIdeaData } from 'services/ideas';
import messages from './messages';
import { fontSizes, colors } from 'utils/styleUtils';
import { openVerificationModalWithContext } from 'containers/App/events';
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
  transition: all 100ms ease-out;
  display: inline-block;
  margin: 0;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
    text-decoration: underline;
  }
`;

interface Props {
  budgetingDescriptor: IIdeaData['attributes']['action_descriptor']['budgeting'];
  participationContextId: string;
  participationContextType: IParticipationContextType;
}

interface State { }

class AssignBudgetDisabled extends PureComponent<Props, State> {
  onVerify = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const { participationContextId, participationContextType } = this.props;
    openVerificationModalWithContext('ActionBudget', participationContextId, participationContextType, 'budgeting');
  }

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  reasonToMessage = () => {
    if (this.props.budgetingDescriptor) {
      const { disabled_reason, future_enabled } = this.props.budgetingDescriptor;

      if (disabled_reason && future_enabled) {
        return messages.budgetingDisabledFutureEnabled;
      } else if (disabled_reason === 'not_verified') {
        return messages.budgetingDisabledNotVerified;
      } else if (disabled_reason === 'not_permitted') {
        return messages.budgetingDisabledNotPermitted;
      }

    }

    return messages.budgetingDisabled;
  }

  render() {
    const { budgetingDescriptor } = this.props;
    const message = this.reasonToMessage();
    const enabledFromDate = (budgetingDescriptor?.future_enabled ? moment(budgetingDescriptor.future_enabled).format('LL') : null);
    const verificationLink = (
      <StyledButton onClick={this.onVerify} onMouseDown={this.removeFocus}>
        <FormattedMessage {...messages.verificationLinkText} />
      </StyledButton>
    );

    return (
      <Container className="e2e-assign-disabled">
        <FormattedMessage {...message} values={{ enabledFromDate, verificationLink }} />
      </Container>
    );
  }
}

export default AssignBudgetDisabled;
