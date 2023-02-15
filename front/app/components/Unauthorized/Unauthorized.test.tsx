import React from 'react';
import Unauthorized from '.';
import { render, screen, fireEvent } from 'utils/testUtils/rtl';
import { openSignUpInModal } from 'events/openSignUpInModal';

let mockUser: any = null;
jest.mock('hooks/useAuthUser', () => () => mockUser);

jest.mock('events/openSignUpInModal', () => ({
  openSignUpInModal: jest.fn(),
}));

describe('<Unauthorized />', () => {
  it('asks you to sign in if logged out', () => {
    mockUser = null;
    render(<Unauthorized />);
    expect(screen.getByText(/log in or sign up/)).toBeInTheDocument();
  });

  it('opens sign up modal when clicking sign up', () => {
    mockUser = null;
    render(<Unauthorized />);
    const button = screen.getByText(/Sign Up/);
    fireEvent.click(button);
    expect(openSignUpInModal).toHaveBeenCalledTimes(1);
    expect(openSignUpInModal).toHaveBeenCalledWith({ flow: 'signup' });
  });

  it('opens sign in modal when clicking sign in', () => {
    mockUser = null;
    render(<Unauthorized />);
    const button = screen.getByText(/Log in/);
    fireEvent.click(button);
    expect(openSignUpInModal).toHaveBeenCalledTimes(1);
    expect(openSignUpInModal).toHaveBeenCalledWith({ flow: 'signin' });
  });

  it("tells you you don't have access if logged in", () => {
    mockUser = {};
    render(<Unauthorized />);
    expect(screen.getByText(/don't have permission/)).toBeInTheDocument();
  });
});
