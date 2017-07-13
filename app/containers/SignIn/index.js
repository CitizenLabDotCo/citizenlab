import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { injectIntl, intlShape } from 'react-intl';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { connect } from 'react-redux';
import { injectTFunc } from 'utils/containers/t/utils';
import styled from 'styled-components';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import _ from 'lodash';
import messages from './messages';
import { signIn } from 'services/auth';
import { isValidEmail } from 'utils/validate';

const Container = styled.div`
  background: #f2f2f2;
`;

const FormContainerOuter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
  padding-top: 40px;
  padding-bottom: 100px;
`;

const Title = styled.h2`
  color: #444;
  font-size: 36px;
  font-weight: 500;
  margin-bottom: 40px;
`;

const FormContainerInner = styled.div`
  width: 100%;
  max-width: 550px;
`;

const FormElement = styled.div`
  width: 100%;
  margin-bottom: 44px;
`;

export class SignIn extends React.PureComponent {
  constructor() {
    super();
    this.state = {
      email: null,
      password: null,
      processing: false,
      emailError: null,
      passwordError: null,
      signInError: null,
    };
  }

  handleEmailOnChange = (email) => {
    this.setState({ email, emailError: null, signInError: null });
  }

  handlePasswordOnChange = (password) => {
    this.setState({ password, passwordError: null, signInError: null });
  }

  handleOnSubmit = async () => {
    const { onSignedIn } = this.props;
    const { formatMessage } = this.props.intl;
    const { email, password } = this.state;

    if (!email || !isValidEmail(email) || !password) {
      if (!email) {
        this.setState({ emailError: formatMessage(messages.noEmailError) });
      }

      if (!isValidEmail(email)) {
        this.setState({ emailError: formatMessage(messages.noValidEmailError) });
      }

      if (!password) {
        this.setState({ passwordError: formatMessage(messages.noPasswordError) });
      }
    } else {
      try {
        this.setState({ processing: true });
        await signIn(email, password);
        this.setState({ processing: false });
        onSignedIn();
      } catch (error) {
        this.setState({ processing: false, signInError: formatMessage(messages.signInError) });
      }
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { email, password, processing, emailError, passwordError, signInError } = this.state;
    const hasAllRequiredContent = [email, password].every((value) => _.isString(value) && !_.isEmpty(value));

    return (
      <Container>
        <FormContainerOuter>
          <Title>{formatMessage(messages.signInTitle)}</Title>

          <FormContainerInner>
            <Label value={formatMessage(messages.emailLabel)} htmlFor="email" />
            <FormElement>
              <Input
                type="email"
                id="email"
                value={email}
                placeholder={formatMessage(messages.emailPlaceholder)}
                error={emailError}
                onChange={this.handleEmailOnChange}
              />
            </FormElement>

            <Label value={formatMessage(messages.passwordLabel)} htmlFor="password" />
            <FormElement>
              <Input
                type="password"
                id="password"
                value={password}
                placeholder={formatMessage(messages.passwordPlaceholder)}
                error={passwordError}
                onChange={this.handlePasswordOnChange}
              />
            </FormElement>

            <FormElement>
              <Button
                size="2"
                loading={processing}
                text={formatMessage(messages.submit)}
                onClick={this.handleOnSubmit}
                disabled={!hasAllRequiredContent}
              />
              <Error text={signInError} />
            </FormElement>
          </FormContainerInner>
        </FormContainerOuter>
      </Container>
    );
  }
}

SignIn.propTypes = {
  opened: PropTypes.bool.isRequired,
  onSignedIn: PropTypes.func.isRequired,
  intl: intlShape,
  tFunc: PropTypes.func.isRequired,
  locale: PropTypes.string.isRequired,
};

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
});

export default injectTFunc(injectIntl(connect(mapStateToProps, null)(SignIn)));
