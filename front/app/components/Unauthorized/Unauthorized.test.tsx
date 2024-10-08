import React from 'react';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import Unauthorized from '.';

let mockUser: any = null;
jest.mock('api/me/useAuthUser', () => () => ({ data: mockUser }));

jest.mock('containers/Authentication/events', () => ({
  triggerAuthenticationFlow: jest.fn(),
}));

describe('<Unauthorized />', () => {
  it('asks you to sign in if logged out', () => {
    mockUser = null;
    render(<Unauthorized />);
    expect(screen.getByText(/log in or sign up/)).toBeInTheDocument();
  });

  it('opens sign in modal when clicking sign in', () => {
    mockUser = null;
    render(<Unauthorized />);
    const button = screen.getByText(/Log in/);
    fireEvent.click(button);
    expect(triggerAuthenticationFlow).toHaveBeenCalledTimes(1);
    expect(triggerAuthenticationFlow).toHaveBeenCalledWith({}, 'signin');
  });

  it("tells you you don't have access if logged in", () => {
    mockUser = {};
    render(<Unauthorized />);
    expect(screen.getByText(/don't have permission/)).toBeInTheDocument();
  });
});
