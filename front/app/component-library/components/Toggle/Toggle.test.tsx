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

  it('does not toggle when disabled', () => {
    const handleOnChange = jest.fn();
    render(<Toggle checked={false} disabled onChange={handleOnChange} />);

    fireEvent.click(screen.getByTestId('toggle'));
    expect(handleOnChange).not.toHaveBeenCalled();
  });

  it('calls onChange when clicked with the bo variant', () => {
    const handleOnChange = jest.fn();
    render(
      <Toggle
        checked={false}
        variant="bo"
        label="Submitting ideas"
        onChange={handleOnChange}
      />
    );

    fireEvent.click(screen.getByText('Submitting ideas'));
    expect(handleOnChange).toHaveBeenCalledTimes(1);
  });
});
