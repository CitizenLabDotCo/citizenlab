import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { injectIntl, intlShape } from 'react-intl';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { connect } from 'react-redux';
import { signInUserRequest } from 'utils/auth/actions';
import { injectTFunc } from 'utils/containers/t/utils';
import styled from 'styled-components';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import _ from 'lodash';
import messages from './messages';

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

export class SignIn extends React.Component {
  constructor() {
    super();

    this.state = {
      firstName: null,
      firstNameError: null,
      lastName: null,
      lastNameError: null,
      email: null,
      emailError: null,
      password: null,
      passwordError: null,
      yearOfBirth: null,
      gender: null,
      area: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.success && nextProps.success) {
      console.log(nextProps.user);
    }
  }

  handleEmailOnChange = (email) => {
    this.setState({
      email,
      emailError: null,
    });
  }

  handlePasswordOnChange = (password) => {
    this.setState({
      password,
      passwordError: null,
    });
  }

  handleOnSubmit = () => {
    const { formatMessage } = this.props.intl;
    const { email, password } = this.state;
    let hasError = false;

    if (!email) {
      hasError = true;
      this.setState({ emailError: formatMessage(messages.emailEmptyError) });
    }

    if (!password) {
      hasError = true;
      this.setState({ passwordError: formatMessage(messages.passwordEmptyError) });
    }

    if (!hasError) {
      this.props.signInUserRequest(email, password);
    }
  }

  render() {
    const { processing } = this.props;
    const { formatMessage } = this.props.intl;
    const { email, emailError, password, passwordError } = this.state;
    const hasRequiredContent = [email, password].every((value) => _.isString(value) && !_.isEmpty(value));
    const hasError = [emailError, passwordError].some((value) => _.isString(value));

    return (
      <div>
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
                  disabled={!hasRequiredContent}
                />
                { hasError && <Error text={formatMessage(messages.formError)} marginTop="0px" showBackground={false} /> }
              </FormElement>
            </FormContainerInner>
          </FormContainerOuter>
        </Container>
      </div>
    );
  }
}

SignIn.propTypes = {
  opened: PropTypes.bool.isRequired,
  onSignedIn: PropTypes.func.isRequired,
  intl: intlShape,
  tFunc: PropTypes.func.isRequired,
  locale: PropTypes.string,
  processing: PropTypes.bool,
  success: PropTypes.bool,
  error: PropTypes.bool,
  user: ImmutablePropTypes.map,
  signInUserRequest: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
  processing: (state) => state.getIn(['signIn', 'processing']),
  success: (state) => state.getIn(['signIn', 'success']),
  error: (state) => state.getIn(['signIn', 'error']),
  user: (state) => state.getIn(['signIn', 'user']),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  signInUserRequest,
}, dispatch);

export default injectTFunc(injectIntl(connect(mapStateToProps, mapDispatchToProps)(SignIn)));
