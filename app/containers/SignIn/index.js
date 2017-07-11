import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { injectIntl, intlShape } from 'react-intl';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { makeSelectAreas } from 'utils/areas/selectors';
import { connect } from 'react-redux';
import { loadAreas } from 'utils/areas/actions';
import { createUserRequest } from 'utils/auth/actions';
import { injectTFunc } from 'utils/containers/t/utils';
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

  componentDidMount() {
    this.props.loadAreas();
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.success && nextProps.success) {
      console.log(nextProps.user);
    }
  }

  getOptions(list) {
    const options = [];

    if (list && list.size && list.size > 0) {
      list.forEach((item) => {
        options.push({
          value: item.get('id'),
          label: this.props.tFunc(item.getIn(['attributes', 'title_multiloc']).toJS()),
        });
      });
    }

    return options;
  }

  getYears() {
    const years = [];

    for (let year = 1900; year <= 2017; year++) { // eslint-disable-line
      years.push({
        value: year,
        label: `${year}`,
      });
    }

    return years;
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

  handleAreaOnChange = (area) => {
    this.setState({ area });
  }

  handleOnSubmit = (firstName, lastName, email, password, yearOfBirth, gender, area, locale, formatMessage, onSignedUp) => () => {
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
      const selectedYearOfBirth = (yearOfBirth ? yearOfBirth.value : null);
      const selectedGender = (gender ? gender.value : null);
      const selectedAreaId = (area ? area.value : null);
      this.props.createUserRequest(firstName, lastName, email, password, selectedGender, selectedYearOfBirth, selectedAreaId);
    }
  }

  render() {
    const { onSignedUp, intl, locale, processing, areas } = this.props;
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
      area,
    } = this.state;

    const hasRequiredContent = [firstName, lastName, email, password].every((value) => _.isString(value) && !_.isEmpty(value));
    const hasError = [firstNameError, lastNameError, emailError, passwordError].some((value) => _.isString(value));

    return (
      <div>
        <Container>
          <FormContainerOuter>
            <Title>{formatMessage(messages.signInTitle)}</Title>

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
                  options={this.getYears()}
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
                  options={this.getOptions(areas)}
                  onChange={this.handleAreaOnChange}
                />
              </FormElement>

              <FormElement>
                <Button
                  size="2"
                  loading={processing}
                  text={formatMessage(messages.submit)}
                  onClick={this.handleOnSubmit(firstName, lastName, email, password, yearOfBirth, gender, area, locale, formatMessage, onSignedUp)}
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
