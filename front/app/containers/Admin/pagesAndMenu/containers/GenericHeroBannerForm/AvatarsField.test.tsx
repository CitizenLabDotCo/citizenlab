import React from 'react';
import AvatarsField from './AvatarsField';
import { render, screen } from 'utils/testUtils/rtl';

jest.mock('utils/cl-intl');

describe('AvatarsField', () => {
  it('renders properly when checked', () => {
    render(<AvatarsField checked={true} onChange={jest.fn()} />);
    const toggle = screen.getByRole('checkbox');

    expect(screen.getByTestId('avatarsField')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('checked', '');
  });

  it('renders properly when not checked', () => {
    render(<AvatarsField checked={false} onChange={jest.fn()} />);
    const toggle = screen.getByRole('checkbox');

    expect(screen.getByTestId('avatarsField')).toBeInTheDocument();
    expect(toggle).not.toHaveAttribute('checked', '');
  });

  it('calls the onChange handler with true correctly when clicked', () => {
    const onChange = jest.fn();
    render(<AvatarsField checked={false} onChange={onChange} />);
    const toggle = screen.getByRole('checkbox');
    toggle.click();

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls the onChange handler correctly with false when clicked', () => {
    const onChange = jest.fn();
    render(<AvatarsField checked={true} onChange={onChange} />);
    const toggle = screen.getByRole('checkbox');
    toggle.click();

    expect(onChange).toHaveBeenCalledWith(false);
  });
});
