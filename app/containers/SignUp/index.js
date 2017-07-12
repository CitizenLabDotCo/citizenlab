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
import Select from 'components/UI/Select';
import _ from 'lodash';
import { observeAreas } from 'services/areas';
import { isValidEmail } from 'utils/validate';
import { signUp, signIn } from 'services/auth';
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

export class SignUp extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      areas: null,
      years: [...Array(118).keys()].map((i) => ({ value: i + 1900, label: `${i + 1900}` })),
      firstName: null,
      lastName: null,
      email: null,
      password: null,
      yearOfBirth: null,
      gender: null,
      area: null,
      processing: null,
      firstNameError: null,
      lastNameError: null,
      emailError: null,
      passwordError: null,
      signUpError: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      observeAreas().observable.subscribe(({ data }) => {
        this.setState({
          areas: data.map((area) => ({
            value: area.id,
            label: this.props.tFunc(area.attributes.title_multiloc),
          })),
        });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  handleFirstNameOnChange = (firstName) => {
    this.setState({ firstName, firstNameError: null, signUpError: null });
  }

  handleLastNameOnChange = (lastName) => {
    this.setState({ lastName, lastNameError: null, signUpError: null });
  }

  handleEmailOnChange = (email) => {
    this.setState({ email, emailError: null, signUpError: null });
  }

  handlePasswordOnChange = (password) => {
    this.setState({ password, passwordError: null, signUpError: null });
  }

  handleYearOfBirthOnChange = (yearOfBirth) => {
    this.setState({ yearOfBirth });
  }

  handleGenderOnChange = (gender) => {
    this.setState({ gender });
  }

  handleAreaOnChange = (area) => {
    this.setState({ area });
  }

  handleOnSubmit = async () => {
    const { onSignedUp } = this.props;
    const { formatMessage } = this.props.intl;
    const { firstName, lastName, email, password, yearOfBirth, gender, area } = this.state;

    if (!firstName || !lastName || !email || !isValidEmail(email) || !password) {
      if (!firstName) {
        this.setState({ firstNameError: formatMessage(messages.noFirstNameError) });
      }

      if (!lastName) {
        this.setState({ lastNameError: formatMessage(messages.noLastNameError) });
      }

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
      const selectedYearOfBirth = (yearOfBirth ? yearOfBirth.value : null);
      const selectedGender = (gender ? gender.value : null);
      const selectedAreaId = (area ? area.value : null);

      try {
        this.setState({ processing: true });
        await signUp(firstName, lastName, email, password, selectedGender, selectedYearOfBirth, selectedAreaId);
        await signIn(email, password);
        this.setState({ processing: false });
        onSignedUp();
      } catch (error) {
        this.setState({ processing: false, signUpError: formatMessage(messages.signUpError) });
      }
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const {
      areas,
      years,
      firstName,
      lastName,
      email,
      password,
      yearOfBirth,
      gender,
      area,
      processing,
      firstNameError,
      lastNameError,
      emailError,
      passwordError,
      signUpError,
    } = this.state;
    const hasRequiredContent = [firstName, lastName, email, password].every((value) => _.isString(value) && !_.isEmpty(value));

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
                  options={years}
                  onChange={this.handleYearOfBirthOnChange}
                />
              </FormElement>

              <Label value={formatMessage(messages.genderLabel)} htmlFor="gender" />
              <FormElement>
                <Select
                  clearable
                  id="gender"
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

              <Label value={formatMessage(messages.areaLabel)} htmlFor="area" />
              <FormElement>
                <Select
                  clearable
                  id="area"
                  value={area}
                  placeholder={formatMessage(messages.areaPlaceholder)}
                  options={areas}
                  onChange={this.handleAreaOnChange}
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
                <Error text={signUpError} />
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
  onSignedUp: PropTypes.func.isRequired,
  intl: intlShape,
  tFunc: PropTypes.func.isRequired,
  locale: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
});

export default injectTFunc(injectIntl(connect(mapStateToProps, null)(SignUp)));
