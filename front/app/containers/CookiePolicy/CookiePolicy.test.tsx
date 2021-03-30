import React from 'react';
import 'jest-styled-components';

jest.mock('utils/cl-intl');
jest.mock('services/pages');
jest.mock('modules', () => ({ streamsToReset: [] }));

import CookiePolicy from './index';
import { shallowWithIntl } from '../../utils/testUtils/withIntl';

describe('<CookiePolicy />', () => {
  it('renders correctly', () => {
    const wrapper = shallowWithIntl(<CookiePolicy />);
    expect(wrapper).toMatchSnapshot();
  });
});
