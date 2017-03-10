import React, { PropTypes } from 'react';
import { Field, reduxForm } from 'redux-form/immutable';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { makeSelectUserData } from './selectors';

const ProfileForm = (props) => (
  <form onSubmit={(form) => props.onSubmitForm(form)}>
    <div>
      <label htmlFor="firstName">First Name</label>
      <Field name="firstName" component="input" type="text" />
    </div>

    <div>
      <label htmlFor="lastName">Last Name</label>
      <Field name="lastName" component="input" type="text" />
    </div>

    <button type="submit">Submit</button>
  </form>
);

ProfileForm.propTypes = {
  onSubmitForm: PropTypes.func.isRequired,
};

const ProfileFormRedux = reduxForm({
  // Per Step# 2: http://redux-form.com/6.2.0/docs/GettingStarted.md/
  // A unique identifier for this form
  form: 'profileForm',
})(ProfileForm);


const mapStateToProps = createStructuredSelector({
  initialValues: makeSelectUserData(),
});

// connect reducers for model updating based on state
export default connect(mapStateToProps)(ProfileFormRedux);
