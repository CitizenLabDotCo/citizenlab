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

  it('renders the description inside the label', () => {
    render(
      <Toggle
        checked={false}
        label="Public answers"
        description="Shown to other participants."
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText('Public answers')).toBeInTheDocument();
    expect(
      screen.getByText('Shown to other participants.').closest('label')
    ).toBe(screen.getByText('Public answers').closest('label'));
  });

  it('does not toggle when disabled', () => {
    const handleOnChange = jest.fn();
    render(<Toggle checked={false} disabled onChange={handleOnChange} />);

    fireEvent.click(screen.getByTestId('toggle'));
    expect(handleOnChange).not.toHaveBeenCalled();
  });
});
