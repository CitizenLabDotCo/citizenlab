import React from 'react';
import { actions, LocalForm } from 'react-redux-form';
// import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

import Input from '../../components/Input/index';
import messages from './messages';

const LabelInputPair = (props) => (
  <div>
    <label htmlFor={props.id}>
      <FormattedMessage {...messages[props.id]} />
    </label>
    <Input id={props.id} />
  </div>
);

LabelInputPair.propTypes = {
  id: React.PropTypes.any,
};

export default class ProfileForm extends React.PureComponent {
  componentWillReceiveProps(nextProps) {
    const user = nextProps.user;
    if (user) {
      this.localFormDispatch(actions.load('profile', user));
    }
  }

  render() {
    return (
      <LocalForm
        model="profile"
        getDispatch={(dispatch) => {
          this.localFormDispatch = dispatch;
        }}
        onSubmit={this.props.onFormSubmit}
      >
        <LabelInputPair id="firstName" />
        <LabelInputPair id="lastName" />
        <LabelInputPair id="email" />
        <LabelInputPair id="gender" />
        <LabelInputPair id="age" />

        <button type="submit">Submit</button>
      </LocalForm>
    );
  }
}

ProfileForm.propTypes = {
  onFormSubmit: React.PropTypes.func.isRequired,
};
