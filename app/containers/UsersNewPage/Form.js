import React from 'react';
import { Grid, Button, Header, Label, Form, Message, Loader } from 'semantic-ui-react';
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
  errorMessage: React.propTypes.array,
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
    this.props.createUser(this.state);
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
              {tFunc(messages.header)}
            </Header>
            <Form onSubmit={this.handleSubmit} error={hasError}>
              <Form.Field>
                <Form.Input
                  fluid icon={'user'}
                  name={'last_name'}
                  iconPosition={'left'}
                  onChange={this.handleChange}
                  value={this.state.first_name}
                  placeholder={tFunc(messages.placeholderFirstName)}
                  error={!!errors.first_name}
                  label={tFunc(messages.labelFirstName)}
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
                  placeholder={tFunc(messages.placeholderLastName)}
                  error={!!errors.last_name}
                  label={tFunc(messages.labelLastName)}
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
                  placeholder={tFunc(messages.placeholderEmail)}
                  error={!!errors.email}
                  label={tFunc(messages.labelEmail)}
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
                  placeholder={tFunc(messages.placeholderPassword)}
                  type={'password'}
                  error={!!errors.password}
                  label={tFunc(messages.labelPassword)}
                />
                <RenderError messages={errors.password} />
              </Form.Field>
              <Button fluid size={'small'} style={{ position: 'relative' }}>
                { pending ?
                  <div style={{ position: 'relative' }}>
                    <span style={{ color: 'rgba(0, 0, 0, 0)' }}> o </span>
                    <Loader size={'mini'} active />
                  </div> :
                  tFunc(messages.buttonSignIn)
                }
              </Button>
            </Form>
            <Message>
              {/* 'ERROR THE LINK IS NOT PROPERLY HANDLED'*/ }
              {tFunc(messages.signUpAction1)} <a href={'/'}>{tFunc(messages.signUpAction2)}</a>
            </Message>

          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

RegistrationForm.propTypes = {
  createUser: React.PropTypes.func.isRequired,
  errors: React.PropTypes.object.isRequired,
  pending: React.PropTypes.bool,
  tFunc: React.PropTypes.func,
};

export default injectTFunc(RegistrationForm);
