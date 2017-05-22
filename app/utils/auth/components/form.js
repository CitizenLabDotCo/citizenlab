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

class SignInForm extends React.Component {
  constructor(props) {
    super();
    this.values = { locale: props.userLocale };
    this.state = { errors: {} };
  }

  componentDidUpdate(prevProvs, prevState) {
    const { run } = this.context.sagas;
    const { newUser } = this.props;
    const enterSaga = enterNewUser(newUser);
    if (!prevState.loading && this.state.loading) {
      run(enterSaga, this.values, this.handleSignInSuccess, this.handleSignInError);
    }
  }

  handleChange = (name, value) => {
    this.values[name] = value;
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ loading: true, errors: {}, error: false });
  }

  handleSignInSuccess = () => {
    this.setState({ loading: false });
    let goToPath = '/';
    if (this.props.newUser) goToPath = '/register/complete';
    return this.props.goTo(goToPath);
  }

  handleSignInSuccess = () => {
    this.setState({ loading: false });
  }

  handleError = (error = {}) => {
    const toNewState = { loading: false, error: true };

    // if no error passed then we are in signin => we have a hard coded Error msg
    if (!error.json) return this.setState(toNewState);

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
    const buttonMessage = newUser ? messages.buttonRegister : messages.buttonSignIn;

    return (
      <Form onSubmit={this.handleSubmit} error={!!error} >
        {this.newUserFields(newUser)}
        <TextInput name={'email'} action={this.handleChange} errors={errors.email} />
        <TextInput name={'password'} action={this.handleChange} errors={errors.password} />
        <Button message={buttonMessage} loading={this.state.loading} />
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
