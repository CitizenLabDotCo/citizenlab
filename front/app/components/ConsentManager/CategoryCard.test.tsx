import React from 'react';
import { render } from 'utils/testUtils/rtl';
import { IDestination, registerDestination } from './destinations';

// component to test
import CategoryCard from './CategoryCard';

// mock utilities
jest.mock('services/appConfiguration');
jest.mock('utils/cl-intl');
jest.mock('modules', () => ({ streamsToReset: [] }));

describe('<CategoryCard />', () => {
  const category = 'analytics';

  const destinations: IDestination[] = ['google_analytics'];

  registerDestination({
    key: 'google_analytics',
    category: 'analytics',
    name: () => 'Google Analytics',
  });

  const handleChange = jest.fn();

  it('renders correctly when allowed', () => {
    render(
      <CategoryCard
        key={category}
        category={category}
        destinations={destinations}
        checked={true}
        handleChange={handleChange}
      />
    );

    // TODO
    // expect(wrapper).toMatchSnapshot();
  });
  it('renders correctly when disallowed', () => {
    render(
      <CategoryCard
        key={category}
        category={category}
        destinations={destinations}
        checked={false}
        handleChange={handleChange}
      />
    );

    // TODO
    // expect(wrapper).toMatchSnapshot();
  });
  it('lets you change your preference', () => {
    // TODO

    const mockOnChange = jest.fn();
    handleChange.mockImplementation(() => mockOnChange);

    const wrapper = render(
      <CategoryCard
        key={category}
        category={category}
        destinations={destinations}
        checked={false}
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
