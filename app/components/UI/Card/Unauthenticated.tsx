import React, { PureComponent, FormEvent } from 'react';
import clHistory from 'utils/cl-router/history';

// components
import Button from 'components/UI/Button';

// styles
import styled, { withTheme } from 'styled-components';
import { darken } from 'polished';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div`
  display: flex;
  align-items: center;
  padding-top: 22px;
  padding-bottom: 22px;
  padding-left: 20px;
  padding-right: 20px;
`;

const StyledLinkButton = styled(Button)`
  margin-left: 5px;

  &:hover .buttonText {
    text-decoration: underline;
  }
`;

interface Props {
  theme: any;
}

interface State { }

class Unauthenticated extends PureComponent<Props, State> {

  stopPropagation = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }

  render() {
    return (
      <Container>
        <StyledLinkButton
          className="e2e-login-button"
          linkTo="/sign-in"
          onClick={this.stopPropagation}
        >
          <FormattedMessage {...messages.login} />
        </StyledLinkButton>

        <StyledLinkButton
          className="e2e-register-button"
          linkTo="/sign-up"
          onClick={this.stopPropagation}
          style="text"
          textColor={this.props.theme.colorMain}
          textHoverColor={darken(0.15, this.props.theme.colorMain)}
        >
          <FormattedMessage {...messages.register} />
        </StyledLinkButton>
      </Container>
    );
  }
}

export default withTheme(Unauthenticated);
