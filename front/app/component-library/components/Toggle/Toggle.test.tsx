import React from 'react';

import { render, screen, fireEvent } from '../../utils/testUtils/rtl';

import Toggle from '.';

describe('<Toggle />', () => {
  it('renders', () => {
    const handleOnChange = jest.fn();
    render(<Toggle checked={false} onChange={handleOnChange} />);
    expect(screen.getByTestId('toggle')).toBeInTheDocument();
  });

  it('calls onChange when clicks', () => {
    const handleOnChange = jest.fn();
    render(<Toggle checked={false} onChange={handleOnChange} />);

    fireEvent.click(screen.getByTestId('toggle'));
    expect(handleOnChange).toHaveBeenCalledTimes(1);
  });

  it('describes the control with the description', () => {
    render(
      <Toggle
        checked={false}
        label="Public answers"
        description="Shown to other participants."
        onChange={jest.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Public answers' });
    expect(checkbox).toHaveAccessibleDescription(
      'Shown to other participants.'
    );
  });

  it('does not toggle when disabled', () => {
    const handleOnChange = jest.fn();
    render(<Toggle checked={false} disabled onChange={handleOnChange} />);

    fireEvent.click(screen.getByTestId('toggle'));
    expect(handleOnChange).not.toHaveBeenCalled();
  });
});
