import React from 'react';
import PropTypes from 'prop-types';
import ImPropTypes from 'react-immutable-proptypes';

// Comoponents
import FormComponent from 'components/forms/formComponent';
import { Form } from 'semantic-ui-react';
import Slider from 'components/forms/inputs/slider';

// store
import { updateUserFork } from 'resources/users/sagas';

// intl
// import messages from '../messages';

class SliderForm extends FormComponent {
  constructor(props) {
    super(props);
    this.saga = updateUserFork;
  }

  resolveRole = () => {
    const roles = this.props.roles.toJS();
    const admingIndex = roles.findIndex((role) => role.type === 'admin');
    if (admingIndex < 0) {
      roles.push({ type: 'admin' });
    } else {
      roles.splice(admingIndex, 1);
    }
    this.isAdmin = (admingIndex >= 0);
    this.values.data = { roles };
  }

  handleSuccess = () => {
    this.setState({ loading: false, disabled: false });
  }

  handleError = () => {
    this.setState({ loading: false, disabled: false });
  }


  handleSuccess = () => this.setState({ loading: false });

  handleChange = () => {
    this.values.id = this.props.userId;
    this.setState({ loading: true, disabled: false });
  }

  render() {
    this.resolveRole();
    const { loading } = this.state;
    return (
      <Form onSubmit={this.handleSubmit} >
        <Slider name={'role'} action={this.handleChange} checked={this.isAdmin} disabled={!!loading} />
      </Form>
    );
  }
}

SliderForm.propTypes = {
  roles: ImPropTypes.list.isRequired,
  userId: PropTypes.string.isRequired,
};

export default SliderForm;
