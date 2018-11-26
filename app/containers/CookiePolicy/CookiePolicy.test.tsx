import React from 'react';
jest.mock('utils/cl-intl');
jest.mock('services/pages');
import { CookiePolicy } from './';

import { shallowWithIntl } from 'utils/testUtils/withIntl';

test('renders', () => {
  const wrapper = shallowWithIntl(<CookiePolicy />);
  expect(wrapper).toMatchSnapshot();
});
