import React from 'react';
import { PropTypes } from 'prop-types';

// Comoponents
import FormComponent from 'components/forms/formComponent';
import { Form } from 'semantic-ui-react';
import RenderError from 'components/forms/renderError';
import TextInput from 'components/forms/inputs/text';
import Button from 'components/buttons/loader';

// store
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { push } from 'react-router-redux';
import { signInUser } from 'utils/auth/sagas';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';

// intl
import messages from '../messages';

class SignInForm extends FormComponent {
  constructor(props) {
    super(props);
    this.values = { locale: props.userLocale };
    this.saga = signInUser;
    this.state = { errors: {} };
  }

  handleSuccess = () => this.props.goTo('/')

  render() {
    const { error, errors } = this.state;

    return (
      <Form onSubmit={this.handleSubmit} error={!!error} >
        <RenderError message={messages.authErrorInvalid} showError={!!error} />
        <TextInput name={'email'} action={this.handleChange} errors={errors.email} />
        <TextInput name={'password'} action={this.handleChange} errors={errors.password} />
        <Button message={messages.buttonSignIn} loading={this.state.loading} />
      </Form>
    );
  }
}

SignInForm.propTypes = {
  userLocale: PropTypes.string,
  goTo: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  userLocale: makeSelectLocale(),
});

export default preprocess(mapStateToProps, { goTo: push })(SignInForm);
