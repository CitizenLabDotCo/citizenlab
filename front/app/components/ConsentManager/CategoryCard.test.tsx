// libraries
import React from 'react';
import { shallow } from 'enzyme';

import 'jest-styled-components';

// component to test
import CategoryCard from './CategoryCard';
import { registerDestination } from './destinations';

// mock utilities
jest.mock('services/appConfiguration');
jest.mock('utils/cl-intl');

describe('<CategoryCard />', () => {
  const category = 'analytics';

  const destinations = ['google_analytics'];
  registerDestination({
    key: 'google_analytics',
    category: 'analytics',
    name: () => 'Google Analytics',
  });
  const handleChange = jest.fn();

  beforeEach(() => {});

  it('renders correctly when null', () => {
    const wrapper = shallow(
      <CategoryCard
        key={category}
        category={category}
        destinations={destinations}
        checked={null}
        handleChange={handleChange}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when allowed', () => {
    const wrapper = shallow(
      <CategoryCard
        key={category}
        category={category}
        destinations={destinations}
        checked={true}
        handleChange={handleChange}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when disallowed', () => {
    const wrapper = shallow(
      <CategoryCard
        key={category}
        category={category}
        destinations={destinations}
        checked={false}
        handleChange={handleChange}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
  it('lets you change your preference', () => {
    const mockOnChange = jest.fn();
    handleChange.mockImplementation(() => mockOnChange);

    const wrapper = shallow(
      <CategoryCard
        key={category}
        category={category}
        destinations={destinations}
        checked={null}
        handleChange={handleChange}
      />
    );
    // when you render the component, handle change is called to calculate the onchange handlers.
    expect(handleChange).toHaveBeenCalledWith(category, false);
    expect(handleChange).toHaveBeenCalledWith(category, true);

    // when you change the value these onchange handlers should be called
    wrapper.find(`#${category}-radio-false`).simulate('change');
    expect(mockOnChange).toHaveBeenCalledTimes(1);

    wrapper.find(`#${category}-radio-true`).simulate('change');
    expect(mockOnChange).toHaveBeenCalledTimes(2);
  });
});
