// import React from 'react';
import { mapDispatchToProps } from '../index';
import { storeProfile } from '../actions';
// import { mount } from 'enzyme';

// import { mountWithIntl } from './intlHelper';
// import ProfileForm from '../ProfileForm';

describe('<ProfileForm />', () => {
  /*
   # TODO: TEST TO MAKE
   - onSubmit STORE_PROFILE action should be dispatched
   - LabelInputPair should render correctly [test with first name]
   - should receives the profile prop when stored is true
   */

  const userData = {
    firstName: 'Manuel',
    lastName: 'Gajo',
    gender: 'Male',
    email: 'manuel@citizenlab.co',
    age: 27,
  };

  describe('mapDispatchToProps', () => {
    describe('onFormSubmit', () => {
      // TODO: fix the following tests
      it('should dispatch storeProfile when called', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);


        result.onFormSubmit(userData);
        expect(dispatch).toHaveBeenCalledWith(storeProfile(userData));
      });
    });
  });
});
