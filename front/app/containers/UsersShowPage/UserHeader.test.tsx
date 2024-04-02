import React from 'react';

import { makeUser } from 'api/users/__mocks__/useUsers';

import { render, screen } from 'utils/testUtils/rtl';

import UserHeader from './UserHeader';

jest.mock('api/users/useUserBySlug');
let mockUser = makeUser();
jest.mock('api/me/useAuthUser', () => () => ({ data: mockUser }));
let mockDisableUsersBiosValue = false;
jest.mock('hooks/useFeatureFlag', () => {
  return () => mockDisableUsersBiosValue;
});

const userSlug = mockUser.data.attributes.slug;

describe('UserHeader', () => {
  it('displays correctly', () => {
    render(<UserHeader userSlug={userSlug} />);
    expect(screen.getByTestId('userHeader')).toBeInTheDocument();
  });

  it('renders edit button link when it is a personal profile', () => {
    render(<UserHeader userSlug={userSlug} />);
    expect(screen.getByText('Edit my profile')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/en/profile/edit'
    );
  });
  it('does not render edit button when it is a different user profile', () => {
    mockUser = makeUser({}, 'differentUserId');
    render(<UserHeader userSlug={userSlug} />);
    expect(screen.queryByText('Edit my profile')).not.toBeInTheDocument();
  });

  it('shows bio when disable_user_bios is false', () => {
    render(<UserHeader userSlug={userSlug} />);
    expect(screen.getByTestId('userHeaderBio')).toBeInTheDocument();
  });

  it('hides bio when disable_user_bios is true', () => {
    mockDisableUsersBiosValue = true;
    render(<UserHeader userSlug={userSlug} />);
    expect(screen.queryByTestId('userHeaderBio')).not.toBeInTheDocument();
  });
});
