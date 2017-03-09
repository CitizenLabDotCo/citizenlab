import React from 'react';
import { Field, reduxForm } from 'redux-form/immutable';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';


import { profileLoaded } from './actions';
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

const ProfileFormRedux = reduxForm({
  // Per Step# 2: http://redux-form.com/6.2.0/docs/GettingStarted.md/
  // A unique identifier for this form
  form: 'profileForm',
})(ProfileForm);

// connect reducers for model updating based on state
// const ProfileFormReduxState = connect(
//   () => ({
//     initialValues: makeSelectUserData(), // pull initial values
//   }),
//   { PROFILE_LOAD_SUCCESS: profileLoaded } // bind action creators
// )(ProfileFormRedux);

const mapStateToProps = createStructuredSelector({
  initialValues: makeSelectUserData(),
});


export default connect(mapStateToProps)(ProfileFormRedux);
