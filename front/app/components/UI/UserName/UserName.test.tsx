import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import UserName from '.';

jest.mock('api/users/useUserById');
jest.mock('api/me/useAuthUser');
// The test setup mocks polished globally; the colour handling under test needs the real one.
jest.unmock('polished');

describe('<UserName />', () => {
  it('renders with a literal colour', () => {
    render(<UserName userId="user" color="#596B7A" />);

    expect(screen.getByText('Test Go Vocal')).toBeInTheDocument();
  });

  it('renders with a CSS variable colour', () => {
    render(<UserName userId="user" color="var(--gv-text-primary)" />);

    expect(screen.getByText('Test Go Vocal')).toBeInTheDocument();
  });
});
