import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { injectIntl, intlShape } from 'react-intl';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { connect } from 'react-redux';
import { loadAreas } from 'utils/areas/actions';
import { createUserRequest } from 'utils/auth/actions';
import styled from 'styled-components';
import Label from 'components/UI/Label';
import Input from 'components/UI/Input';
import Button from 'components/UI/Button';
import Select from 'components/UI/Select';
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

export class SignUp extends React.Component {
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
    };
  }

  handleFirstNameOnChange = (firstName) => {
    this.setState({
      firstName,
      firstNameError: null,
    });
  }

  handleLastNameOnChange = (lastName) => {
    this.setState({
      lastName,
      lastNameError: null,
    });
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

  handleYearOfBirthOnChange = (yearOfBirth) => {
    this.setState({ yearOfBirth });
  }

  handleGenderOnChange = (gender) => {
    this.setState({ gender });
  }

  handleOnSubmit = (firstName, lastName, email, password, yearOfBirth, gender, locale, formatMessage, onSignedIn) => () => {
    let hasError = false;

    if (!firstName) {
      hasError = true;
      this.setState({ firstNameError: formatMessage(messages.firstNameEmptyError) });
    }

    if (!lastName) {
      hasError = true;
      this.setState({ lastNameError: formatMessage(messages.lastNameEmptyError) });
    }

    if (!email) {
      hasError = true;
      this.setState({ emailError: formatMessage(messages.emailEmptyError) });
    }

    if (!password) {
      hasError = true;
      this.setState({ passwordError: formatMessage(messages.passwordEmptyError) });
    }

    if (!hasError) {
      console.log(firstName, lastName, email, password, yearOfBirth, gender, locale);
      // onSignedIn();
      // this.props.createUserRequest(firstName, lastName, email, password, locale, null, null, null);
    }
  }

  render() {
    const { onSignedIn, intl, locale, processing } = this.props;
    const { formatMessage } = intl;
    const {
      firstName,
      firstNameError,
      lastName,
      lastNameError,
      email,
      emailError,
      password,
      passwordError,
      yearOfBirth,
      gender,
    } = this.state;

    const hasRequiredContent = [firstName, lastName, email, password].every((value) => _.isString(value) && !_.isEmpty(value));
    const hasError = [firstNameError, lastNameError, emailError, passwordError].some((value) => _.isString(value));

    return (
      <div>
        <Container>
          <FormContainerOuter>
            <Title>{formatMessage(messages.signUpTitle)}</Title>

            <FormContainerInner>
              <Label value={formatMessage(messages.firstNameLabel)} htmlFor="firstName" />
              <FormElement>
                <Input
                  id="firstName"
                  value={firstName}
                  placeholder={formatMessage(messages.firstNamePlaceholder)}
                  error={firstNameError}
                  onChange={this.handleFirstNameOnChange}
                />
              </FormElement>

              <Label value={formatMessage(messages.lastNameLabel)} htmlFor="lastName" />
              <FormElement>
                <Input
                  id="lastName"
                  value={lastName}
                  placeholder={formatMessage(messages.lastNamePlaceholder)}
                  error={lastNameError}
                  onChange={this.handleLastNameOnChange}
                />
              </FormElement>

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

              <Label value={formatMessage(messages.yearOfBirthLabel)} htmlFor="yearOfBirth" />
              <FormElement>
                <Select
                  clearable
                  searchable
                  value={yearOfBirth}
                  placeholder={formatMessage(messages.yearOfBirthPlaceholder)}
                  options={[{
                    value: '1998',
                    label: '1998',
                  }, {
                    value: '1999',
                    label: '1999',
                  }, {
                    value: '2000',
                    label: '2000',
                  }]}
                  onChange={this.handleYearOfBirthOnChange}
                />
              </FormElement>

              <Label value={formatMessage(messages.genderLabel)} htmlFor="gender" />
              <FormElement>
                <Select
                  clearable
                  value={gender}
                  placeholder={formatMessage(messages.genderPlaceholder)}
                  options={[{
                    value: 'female',
                    label: formatMessage(messages.male),
                  }, {
                    value: 'male',
                    label: formatMessage(messages.female),
                  }, {
                    value: 'unspecified',
                    label: formatMessage(messages.unspecified),
                  }]}
                  onChange={this.handleGenderOnChange}
                />
              </FormElement>

              <FormElement>
                <Button
                  size="2"
                  loading={processing}
                  text={formatMessage(messages.submit)}
                  onClick={this.handleOnSubmit(firstName, lastName, email, password, yearOfBirth, gender, locale, formatMessage, onSignedIn)}
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

SignUp.propTypes = {
  opened: PropTypes.bool.isRequired,
  onSignedIn: PropTypes.func.isRequired,
  intl: intlShape,
  locale: PropTypes.string,
  processing: PropTypes.bool,
  loadAreas: PropTypes.func,
  createUserRequest: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
  processing: (state) => state.getIn(['signUp', 'processing']),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  loadAreas,
  createUserRequest,
}, dispatch);

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SignUp));
