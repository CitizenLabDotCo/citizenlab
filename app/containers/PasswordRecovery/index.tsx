import React from 'react';

// components
import { Input, Success } from 'cl2-component-library';
import Button from 'components/UI/Button';
import { Helmet } from 'react-helmet';
import ContentContainer from 'components/ContentContainer';
import { FormLabel } from 'components/UI/FormComponents';

// services
import { sendPasswordResetMail } from 'services/auth';

// utils
import { isValidEmail } from 'utils/validate';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import messages from './messages';
import { fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  background: ${colors.background};
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 100px;
`;

const Title = styled.h1`
  width: 100%;
  color: #333;
  font-size: ${fontSizes.xxxxl}px;
  line-height: 40px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  padding: 0;
  padding-top: 60px;
  margin-bottom: 15px;
`;

const Subtitle = styled.p`
  color: #444;
  font-size: 18px;
  line-height: 22px;
  font-weight: 300;
  text-align: center;
  margin: 0;
  padding: 0;
  margin-bottom: 50px;
`;

const StyledInput = styled(Input)``;

const StyledButton = styled(Button)`
  margin-top: 20px;
  margin-bottom: 10px;
`;

const Form = styled.form`
  width: 100%;
  max-width: 380px;
  padding-left: 20px;
  padding-right: 20px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
`;

type Props = {};

type State = {
  email: string | null;
  emailError: boolean;
  submitError: boolean;
  processing: boolean;
  success: boolean;
  successEmail: string | null;
};

class PasswordRecovery extends React.PureComponent<
  Props & InjectedIntlProps,
  State
> {
  emailInputElement: HTMLInputElement | null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      email: null,
      emailError: false,
      submitError: false,
      processing: false,
      success: false,
      successEmail: null,
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
          successEmail: email,
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
    const {
      email,
      emailError,
      submitError,
      processing,
      success,
      successEmail,
    } = this.state;
    const helmetTitle = formatMessage(messages.helmetTitle);
    const helmetDescription = formatMessage(messages.helmetDescription);
    const title = formatMessage(messages.title);
    const subtitle = formatMessage(messages.subtitle);
    const emailPlaceholder = formatMessage(messages.emailPlaceholder);
    const resetPassword = formatMessage(messages.resetPassword);
    const successMessage = success
      ? formatMessage(messages.successMessage, { email: `${successEmail}` })
      : null;
    let errorMessage: string | null = null;

    if (emailError) {
      errorMessage = formatMessage(messages.emailError);
    } else if (submitError) {
      errorMessage = formatMessage(messages.submitError);
    }

    return (
      <Container>
        <Helmet
          title={helmetTitle}
          meta={[{ name: 'description', content: helmetDescription }]}
        />
        <main>
          <StyledContentContainer>
            <Title>{title}</Title>

            <Subtitle>{subtitle}</Subtitle>

            <Form onSubmit={this.handleOnSubmit}>
              <FormLabel htmlFor="email" labelMessage={messages.emailLabel} />
              <StyledInput
                id="email"
                type="text"
                value={email}
                error={errorMessage}
                placeholder={emailPlaceholder}
                onChange={this.handleEmailOnChange}
                setRef={this.handleEmailInputSetRef}
              />

              {/* <Error fieldName="title_multiloc" apiErrors={this.state.errors.title_multiloc} /> */}

              <StyledButton
                size="2"
                width="100%"
                processing={processing}
                text={resetPassword}
                onClick={this.handleOnSubmit}
                className="e2e-submit-reset"
              />

              {successMessage && (
                <Success text={successMessage} className="e2e-success-reset" />
              )}
            </Form>
          </StyledContentContainer>
        </main>
      </Container>
    );
  }
}

export default injectIntl<Props>(PasswordRecovery);
