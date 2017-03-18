import React from 'react';
import { LocalForm } from 'react-redux-form';
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

const ProfileForm = (props) => (
  <LocalForm
    model="profile"
    onSubmit={props.onFormSubmit}
  >
    <LabelInputPair id="firstName" />
    <LabelInputPair id="lastName" />
    <LabelInputPair id="email" />
    <LabelInputPair id="gender" />
    <LabelInputPair id="age" />

    <button type="submit">Submit</button>
  </LocalForm>
);
ProfileForm.propTypes = {
  onFormSubmit: React.PropTypes.func.isRequired,
};

export default ProfileForm;
