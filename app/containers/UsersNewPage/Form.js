import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Button, Header, Label, Form, Loader } from 'semantic-ui-react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
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
    this.props.createUser(this.state);
  }

  render() {
    const { errors, pending } = this.props;
    const { formatMessage } = this.props.intl;
    const errorTypes = Object.keys(errors);
    const hasError = errorTypes.reduce((err, state) => (!!errors[err] || state), false);

    return (
      <div>
        <Grid centered verticalAlign={'middle'}>
          <Grid.Column>
            <Header as={'h2'}>
              <FormattedMessage {...messages.header} />
            </Header>
            <Form onSubmit={this.handleSubmit} error={hasError}>
              <Form.Field>
                <Form.Input
                  fluid icon={'user'}
                  name={'first_name'}
                  iconPosition={'left'}
                  onChange={this.handleChange}
                  value={this.state.first_name}
                  placeholder={formatMessage(messages.placeholderFirstName)}
                  error={!!errors.first_name}
                  label={formatMessage(messages.labelFirstName)}
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
                  placeholder={formatMessage(messages.placeholderLastName)}
                  error={!!errors.last_name}
                  label={formatMessage(messages.labelLastName)}
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
                  placeholder={formatMessage(messages.placeholderEmail)}
                  error={!!errors.email}
                  label={formatMessage(messages.labelEmail)}
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
                  placeholder={formatMessage(messages.placeholderPassword)}
                  type={'password'}
                  error={!!errors.password}
                  label={formatMessage(messages.labelPassword)}
                />
                <RenderError messages={errors.password} />
              </Form.Field>
              {this.props.children}
              <Button fluid size={'small'} style={{ position: 'relative' }}>
                { pending ?
                  <div style={{ position: 'relative' }}>
                    <span style={{ color: 'rgba(0, 0, 0, 0)' }}> o </span>
                    <Loader size={'mini'} active />
                  </div> :
                  <FormattedMessage {...messages.buttonRegister} />
                }
              </Button>
            </Form>

          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

RegistrationForm.propTypes = {
  createUser: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  pending: PropTypes.bool,
  children: PropTypes.element,
  intl: intlShape.isRequired,
};

export default injectIntl(RegistrationForm);
