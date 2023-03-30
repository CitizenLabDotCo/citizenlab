import React from 'react';

// components
import { Success, Box } from '@citizenlab/cl2-component-library';
import { Helmet } from 'react-helmet';
import { FormLabel } from 'components/UI/FormComponents';
import {
  StyledContentContainer,
  Title,
  StyledButton,
  Form,
  Subtitle,
  StyledInput,
} from 'components/smallForm';

// services
import sendPasswordResetMail from 'api/authentication/sendPasswordResetEmail';

// utils
import { isValidEmail } from 'utils/validate';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// style
import messages from './messages';
import { stylingConsts } from 'utils/styleUtils';

interface Props {}

type State = {
  email: string | null;
  emailError: boolean;
  submitError: boolean;
  processing: boolean;
  success: boolean;
};

class PasswordRecovery extends React.PureComponent<
  Props & WrappedComponentProps,
  State
> {
  emailInputElement: HTMLInputElement | null;

  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {
      email: null,
      emailError: false,
      submitError: false,
      processing: false,
      success: false,
    };
    this.emailInputElement = null;
  }

  componentDidMount() {
    if (this.emailInputElement) {
      this.emailInputElement.focus();
    }
  }

  validate = (email: string | null) => {
    const emailError = !email || !isValidEmail(email);

    if (emailError && this.emailInputElement) {
      this.emailInputElement.focus();
    }

    this.setState({ emailError });

    return !emailError;
  };

  handleEmailOnChange = (value) => {
    this.setState({
      emailError: false,
      submitError: false,
      email: value,
    });
  };

  handleEmailInputSetRef = (element: HTMLInputElement) => {
    this.emailInputElement = element;
  };

  handleOnSubmit = async (event) => {
    const { email } = this.state;

    event.preventDefault();

    if (this.validate(email) && email) {
      try {
        this.setState({ processing: true, success: false });
        await sendPasswordResetMail(email);
        this.setState({
          email: null,
          processing: false,
          success: true,
        });
        /* setTimeout(() => this.setState({ success: false }), 8000); */
      } catch {
        this.setState({ processing: false, success: false, submitError: true });
      }
    } else {
      this.setState({ emailError: true });
    }
  };

  render() {
    const { formatMessage } = this.props.intl;
    const { email, emailError, submitError, processing, success } = this.state;
    const helmetTitle = formatMessage(messages.helmetTitle);
    const helmetDescription = formatMessage(messages.helmetDescription);
    const title = formatMessage(messages.title);
    const subtitle = formatMessage(messages.subtitle);
    const emailPlaceholder = formatMessage(messages.emailPlaceholder);
    const resetPassword = formatMessage(messages.resetPassword);

    // Showing the same message for success and submission error because we don't want to give away information about whether an email address is registered or not
    const feedbackMessage =
      success || submitError
        ? formatMessage(messages.passwordResetSuccessMessage)
        : null;
    let errorMessage: string | null = null;

    if (emailError) {
      errorMessage = formatMessage(messages.emailError);
    }

    return (
      <Box
        width="100%"
        minHeight={`calc(100vh - ${
          stylingConsts.menuHeight + stylingConsts.footerHeight
        }px)`}
      >
        <Helmet
          title={helmetTitle}
          meta={[{ name: 'description', content: helmetDescription }]}
        />
        <main>
          <StyledContentContainer>
            <Title style={{ marginBottom: '15px' }}>{title}</Title>

            <Subtitle>{subtitle}</Subtitle>

            <Form onSubmit={this.handleOnSubmit}>
              <FormLabel htmlFor="email" labelMessage={messages.emailLabel} />
              <StyledInput
                id="email"
                type="email"
                autocomplete="email"
                value={email}
                error={errorMessage}
                placeholder={emailPlaceholder}
                onChange={this.handleEmailOnChange}
                setRef={this.handleEmailInputSetRef}
              />

              <StyledButton
                size="m"
                width="100%"
                processing={processing}
                text={resetPassword}
                onClick={this.handleOnSubmit}
                className="e2e-submit-reset"
              />

              {feedbackMessage && (
                <Success text={feedbackMessage} className="e2e-success-reset" />
              )}
            </Form>
          </StyledContentContainer>
        </main>
      </Box>
    );
  }
}

export default injectIntl(PasswordRecovery);
