import React from 'react';
import { Grid, Button, Header, Label, Form, Message, Loader, Segment } from 'semantic-ui-react';
import messages from './messages';
import T from 'containers/T';
import { injectTFunc } from 'containers/T/utils';

//  <LocalForm model="'auth'" onSubmit={props.onSubmit}>


const initialState = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
};

const RenderError = (props) => {
  const { messages } = props;
  if (!messages) return null;
  return(
    <Label basic color='red' pointing>{messages.join(", ")}</Label>
  );
};

class RegistrationForm extends React.Component {
  constructor(){
    super();
    this.state = initialState;
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.onSubmit(this.state);
  }

  render() {
    const { errors, tFunc, pending } = this.props;
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
                    <span style={{ color: "rgba(0, 0, 0, 0)" }}> o </span>
                    <Loader size='mini' active />
                  </div> :
                  tFunc(messages.buttonSignIn)
                }
              </Button>
            </Form>
            {this.props.children}
            <Message>
              {/*"ERROR THE LINK IS NOT PROPERLY HANDLED"*/ }
              {tFunc(messages.signUpAction1)} <a href={'/'}>{tFunc(messages.signUpAction2)}</a>
            </Message>

          </Grid.Column>
        </Grid>
      </div>
    );
  }
};

RegistrationForm.propTypes = {
  onSubmit: React.PropTypes.func.isRequired,
  errors: React.PropTypes.object.isRequired,
  pending: React.PropTypes.bool,
  tFunc: React.PropTypes.func,
  children: React.PropTypes.element,
};

export default injectTFunc(RegistrationForm);
