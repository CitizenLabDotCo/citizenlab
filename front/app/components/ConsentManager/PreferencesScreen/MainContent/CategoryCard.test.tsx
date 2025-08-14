import React from 'react';

import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import { IDestination, registerDestination } from '../../destinations';

// component to test
import CategoryCard from './CategoryCard';

// mock utilities

const getRadioInputs = () => {
  const allowButton = screen.getByRole('radio', { name: 'Allow' });
  const disallowButton = screen.getByRole('radio', { name: 'Disallow' });

  return { allowButton, disallowButton };
};

describe('<CategoryCard />', () => {
  const category = 'analytics';

  const destinations: IDestination[] = ['google_analytics'];

  registerDestination({
    key: 'google_analytics',
    category,
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
        onChange={handleChange}
      />
    );

    const { allowButton, disallowButton } = getRadioInputs();
    expect(allowButton).toBeChecked();
    expect(disallowButton).not.toBeChecked();
  });

  it('renders correctly when disallowed', () => {
    render(
      <CategoryCard
        key={category}
        category={category}
        destinations={destinations}
        checked={false}
        onChange={handleChange}
      />
    );

    const { allowButton, disallowButton } = getRadioInputs();

    expect(allowButton).not.toBeChecked();
    expect(disallowButton).toBeChecked();
  });

  it('lets you change your preference', () => {
    render(
      <CategoryCard
        key={category}
        category={category}
        destinations={destinations}
        checked={false}
        onChange={handleChange}
      />
    );
    const { allowButton, disallowButton } = getRadioInputs();

    // when you change the value these onchange handlers should be called
    fireEvent.click(allowButton);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('analytics', true);

    fireEvent.click(disallowButton);
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenCalledWith('analytics', false);
  });
});
