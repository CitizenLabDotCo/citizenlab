import React from 'react';
import { PropTypes } from 'prop-types';

// Comoponents
import { Form } from 'semantic-ui-react';
import RenderError from 'components/forms/renderError';
import TextInput from 'components/forms/inputs/text';
import Button from 'components/buttons/loader';

// store
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { push } from 'react-router-redux';
import { enterNewUser } from 'utils/auth/sagas';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';

// intl
import messages from '../messages';

class FormComponent extends React.Component {
  constructor() {
    super();
    this.state = { errors: {} };
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ loading: true, errors: {}, error: false });
  }

  componentDidUpdate(prevProvs, prevState) {
    const { run } = this.context.sagas;
    if (!prevState.loading && this.state.loading) {
      run(this.enterSaga, this.values, this.handleEnterSuccess, this.handleEnterError);
    }
  }
}



class SignInForm extends React.Component {
  constructor(props) {
    super();
    this.values = { locale: props.userLocale };

    const { newUser } = props;
    this.enterSaga = enterNewUser(newUser);
    this.goToPath = newUser ? '/register/complete' : '/';
    this.handleEnterError = newUser ? this.handleErrorRegister : this.handleErrorSignIn;
    this.buttonMessage = newUser ? messages.buttonRegister : messages.buttonSignIn;
  }

  componentDidUpdate(prevProvs, prevState) {
    const { run } = this.context.sagas;
    if (!prevState.loading && this.state.loading) {
      run(this.enterSaga, this.values, this.handleEnterSuccess, this.handleEnterError);
    }
  }

  handleChange = (name, value) => {
    this.values[name] = value;
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ loading: true, errors: {}, error: false });
  }

  handleEnterSuccess = () => {
    this.setState({ loading: false });
    return this.props.goTo(this.goToPath);
  }

  handleErrorSignIn = () => {
    this.setState({ loading: false, error: true });
  }

  handleErrorRegister = (error = {}) => {
    const toNewState = { loading: false, error: true };
    const errors = error.json.errors;
    const errorsObje = {};

    // translate Errors to arrays snake case strings
    Object.keys(errors).forEach((type) => {
      errorsObje[type] = errors[type].map(
        (ele) => `${type}_error_${ele.error}`
      );
    });
    toNewState.errors = errorsObje;

    return this.setState(toNewState);
  }

  newUserFields = (newUser) => {
    const { errors, error } = this.state;
    if (!newUser) return <RenderError message={messages.authError} showError={!!error} />;
    return [
      <TextInput key={'first_name'} name={'first_name'} action={this.handleChange} errors={errors.first_name} />,
      <TextInput key={'last_name'} name={'last_name'} action={this.handleChange} errors={errors.last_name} />,
    ];
  }

  render() {
    const { error, errors } = this.state;
    const { newUser } = this.props;

    return (
      <Form onSubmit={this.handleSubmit} error={!!error} >
        {this.newUserFields(newUser)}
        <TextInput name={'email'} action={this.handleChange} errors={errors.email} />
        <TextInput name={'password'} action={this.handleChange} errors={errors.password} />
        <Button message={this.buttonMessage} loading={this.state.loading} />
      </Form>
    );
  }
}

SignInForm.contextTypes = {
  sagas: PropTypes.func.isRequired,
};

SignInForm.propTypes = {
  newUser: PropTypes.bool.isRequired,
  userLocale: PropTypes.string,
  // enterNewUser: PropTypes.func,
  goTo: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  userLocale: makeSelectLocale(),
});

export default preprocess(mapStateToProps, { goTo: push })(SignInForm);
