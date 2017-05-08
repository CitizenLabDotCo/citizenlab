import React from 'react';
import { Grid, Button, Header, Label, Form, Message, Loader } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { injectTFunc } from 'containers/T/utils';

import messages from './messages';


const initialState = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
};


const RenderError = (props) => {
  const { errorMessage } = props;
  if (!errorMessage) return null;
  return (
    <Label basic color={'red'} pointing>{errorMessage.join(', ')}</Label>
  );
};

RenderError.propTypes = {
  errorMessage: React.PropTypes.array,
};

class RegistrationForm extends React.Component {
  constructor() {
    super();
    this.state = initialState;
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.registerUser(this.state);
  }

  render() {
    const { errors, pending, tFunc } = this.props;
    const errorTypes = Object.keys(errors);
    const hasError = errorTypes.reduce((err, state) => (!!errors[err] || state), false);

    return (
      <div >
        <Grid centered verticalAlign={'middle'}>
          <Grid.Column>
            <Header as={'h2'}>
              {<FormattedMessage {...messages.header} />}
            </Header>
            <Form onSubmit={this.handleSubmit} error={hasError}>
              <Form.Field>
                <Form.Input
                  fluid icon={'user'}
                  name={'first_name'}
                  iconPosition={'left'}
                  onChange={this.handleChange}
                  value={this.state.first_name}
                  // placeholder={<FormattedMessage {...messages.placeholderFirstName} />}
                  error={!!errors.first_name}
                  label={<FormattedMessage {...messages.labelFirstName} />}
                />
                <RenderError messages={errors.first_name} />
              </Form.Field>

              <Form.Field>
                <Form.Input
                  fluid icon={'user'}
                  name={'last_name'}
                  iconPosition={'left'}
                  onChange={this.handleChange}
                  value={this.state.last_name}
                  // placeholder={<FormattedMessage {...messages.placeholderLastName} />}
                  error={!!errors.last_name}
                  label={<FormattedMessage {...messages.labelLastName} />}
                />
                <RenderError messages={errors.last_name} />
              </Form.Field>

              <Form.Field>
                <Form.Input
                  fluid icon={'mail'}
                  name={'email'}
                  iconPosition={'left'}
                  onChange={this.handleChange}
                  value={this.state.email}
                  // placeholder={<FormattedMessage {...messages.placeholderEmail} />}
                  error={!!errors.email}
                  label={<FormattedMessage {...messages.labelEmail} />}
                />
                <RenderError messages={errors.email} />
              </Form.Field>

              <Form.Field>
                <Form.Input
                  fluid icon={'lock'}
                  name={'password'}
                  iconPosition={'left'}
                  onChange={this.handleChange}
                  value={this.state.password}
                  // placeholder={<FormattedMessage {...messages.placeholderPassword} />}
                  type={'password'}
                  error={!!errors.password}
                  label={<FormattedMessage {...messages.labelPassword} />}
                />
                <RenderError messages={errors.password} />
              </Form.Field>
              <Button fluid size={'small'} style={{ position: 'relative' }}>
                { pending ?
                  <div style={{ position: 'relative' }}>
                    <span style={{ color: 'rgba(0, 0, 0, 0)' }}> o </span>
                    <Loader size={'mini'} active />
                  </div> :
                  <FormattedMessage {...messages.buttonSignIn} />
                }
              </Button>
            </Form>
            <Message>
              {/* 'ERROR THE LINK IS NOT PROPERLY HANDLED'*/ }
              {<FormattedMessage {...messages.signUpAction1} />} <a href={'/'}>{<FormattedMessage {...messages.signUpAction2} />}</a>
            </Message>

          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

RegistrationForm.propTypes = {
  registerUser: React.PropTypes.func.isRequired,
  errors: React.PropTypes.object.isRequired,
  pending: React.PropTypes.bool,
  tFunc: React.PropTypes.func,
};

export default injectTFunc(RegistrationForm);
