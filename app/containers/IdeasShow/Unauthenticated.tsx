import React from 'react';
import styled, { withTheme } from 'styled-components';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { fontSizes, colors } from 'utils/styleUtils';

const VerticalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Separator = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  margin-top: 12px;
  margin-bottom: 8px;
`;

interface Props {
  theme: any;
}

interface State { }

class Unauthenticated extends React.PureComponent<Props, State> {
  render() {
    return (
      <VerticalContainer>
        <Button
          className="e2e-login-button"
          linkTo="/sign-in"
        >
          <FormattedMessage {...messages.login} />
        </Button>
        <Separator>
          <FormattedMessage {...messages.or} />
        </Separator>
        <Button
          className="e2e-register-button"
          linkTo="/sign-up"
          buttonStyle="text"
          padding="0px"
          textDecorationHover="underline"
          textColor={this.props.theme.colorMain}
        >
          <FormattedMessage {...messages.register} />
        </Button>
      </VerticalContainer>
    );
  }
}

export default withTheme(Unauthenticated);
