import React from 'react';
// import { mount } from 'enzyme';

import { mountWithIntl } from './intlHelper';
import ProfileForm from '../ProfileForm';

describe('<ProfileForm />', () => {
  it('calls onSubmit handler', () => {
    const handleSubmitMock = jest.fn();
    const wrapper = mountWithIntl(<ProfileForm onFormSubmit={handleSubmitMock} />);
    wrapper.find('[type="submit"]').get(0).click();
    expect(handleSubmitMock.mock.calls.length).toEqual(1);
  });
});
