// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import { UserComments } from './UserComments';

// mock utilities
jest.mock('utils/cl-intl');
const Intl = require('utils/cl-intl/__mocks__/');
const { intl } = Intl;

describe('<ConsentManager />', () => {

  it('renders correctly when no cookie is set (destinations = newDestinations)', () => {
    const wrapper = shallow();
  });
});
