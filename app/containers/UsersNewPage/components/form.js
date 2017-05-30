import React from 'react';
import { PropTypes } from 'prop-types';

// Comoponents
import FormComponent from 'components/forms/formComponent';
import { Form } from 'semantic-ui-react';
import TextInput from 'components/forms/inputs/text';
import Button from 'components/buttons/loader';

// store
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { push } from 'react-router-redux';
import { createUser } from 'utils/auth/sagas';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';

// intl
import messages from '../messages';

class RegistrationForm extends FormComponent {
  constructor(props) {
    super(props);
    this.values = { locale: props.userLocale };
    this.saga = createUser;
  }

  handleSuccess = () => this.props.goTo('/register/complete');

  render() {
    const { error, errors } = this.state;

    return (
      <Form onSubmit={this.handleSubmit} error={!!error} >
        <TextInput name={'first_name'} action={this.handleChange} errors={errors.first_name} />
        <TextInput name={'last_name'} action={this.handleChange} errors={errors.last_name} />
        <TextInput name={'email'} action={this.handleChange} errors={errors.email} />
        <TextInput name={'password'} action={this.handleChange} errors={errors.password} />
        <Button message={messages.buttonRegister} loading={this.state.loading} />
      </Form>
    );
  }
}

RegistrationForm.propTypes = {
  userLocale: PropTypes.string,
  goTo: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  userLocale: makeSelectLocale(),
});

export default preprocess(mapStateToProps, { goTo: push })(RegistrationForm);
