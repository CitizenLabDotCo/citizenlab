import React from 'react';
import { fireEvent, render } from 'utils/testUtils/rtl';
import { IDestination, registerDestination } from '../destinations';

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
    const { container } = render(
      <CategoryCard
        key={category}
        category={category}
        destinations={destinations}
        checked={true}
        onChange={handleChange}
      />
    );

    const allowButton = container.querySelector('#analytics-radio-true');
    const disallowButton = container.querySelector('#analytics-radio-false');

    expect(allowButton).toBeChecked();
    expect(disallowButton).not.toBeChecked();
  });

  it('renders correctly when disallowed', () => {
    const { container } = render(
      <CategoryCard
        key={category}
        category={category}
        destinations={destinations}
        checked={false}
        onChange={handleChange}
      />
    );

    const allowButton = container.querySelector('#analytics-radio-true');
    const disallowButton = container.querySelector('#analytics-radio-false');

    expect(allowButton).not.toBeChecked();
    expect(disallowButton).toBeChecked();
  });

  it('lets you change your preference', () => {
    const { container } = render(
      <CategoryCard
        key={category}
        category={category}
        destinations={destinations}
        checked={false}
        onChange={handleChange}
      />
    );

    // when you change the value these onchange handlers should be called
    const allowButton = container.querySelector('#analytics-radio-true');
    fireEvent.click(allowButton);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('analytics', true);

    const disallowButton = container.querySelector('#analytics-radio-false');
    fireEvent.click(disallowButton);
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenCalledWith('analytics', false);
  });
});
