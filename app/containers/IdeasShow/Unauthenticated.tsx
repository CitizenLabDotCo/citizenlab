import React from 'react';
import styled, { withTheme } from 'styled-components';
import { darken } from 'polished';
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
  margin-top: 8px;
  margin-bottom: 4px;
`;

const StyledButton = styled(Button)`
  &:hover .buttonText {
    text-decoration: underline;
  }
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
        <StyledButton
          className="e2e-register-button"
          linkTo="/sign-up"
          style="text"
          textColor={this.props.theme.colorMain}
          textHoverColor={darken(0.15, this.props.theme.colorMain)}
        >
          <FormattedMessage {...messages.register} />
        </StyledButton>
      </VerticalContainer>
    );
  }
}

export default withTheme(Unauthenticated);
