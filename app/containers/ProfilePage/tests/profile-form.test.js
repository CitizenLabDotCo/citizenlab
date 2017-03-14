// import React from 'react';
import { mapDispatchToProps } from '../profile-form';
import { storeProfile } from '../actions';
// import { shallow } from 'enzyme';

// import { ProfileLabel, ProfileInput } from '../profile-form'

describe('<ProfileForm />', () => {
  const userData = {
    firstName: 'Manuel',
    lastName: 'Gajo',
    gender: 'Male',
    email: 'manuel@citizenlab.co',
    age: 27,
  };

  describe('mapDispatchToProps', () => {
    describe('onFormSubmit', () => {
      it('should be injected', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);
        expect(result.onFormSubmit).toBeDefined();
      });

      // TODO: fix the following tests
      it('should dispatch storeProfile when called', () => {
        const dispatch = jest.fn();
        const result = mapDispatchToProps(dispatch);


        result.onFormSubmit(userData);
        expect(dispatch).toHaveBeenCalledWith(storeProfile(userData));
      });
    });
  });

 /* it('should preload form fields if fetch successful', () => {
    const renderedComponent = shallow(
      <ProfileForm {...userData} />
    );
    // TODO: complete
    const fields = ['firstName', 'lastName', 'email', 'gender', 'age'];
    const fieldIntl = ['First Name', 'Last Name', 'E-mail', 'Gender', 'Age'];
    fields.forEach((fieldId, i) => {
        const model = '.'.concat(fieldId)
        expect(renderedComponent.contains(<label htmlFor={fieldId}>{fieldIntl[i]}</label>)).toEqual(true);
        expect(renderedComponent.contains(<Control.text name={props.id} model={model} />)).toEqual(true);
      }
    )
  });*/

  it('should preload form fields if fetch successful', () => {
    // TODO
    expect(true).toEqual(true);
  });
});
