import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';
import UserHeader from './UserHeader';

jest.mock('api/users/useUserBySlug', () =>
  jest.fn(() => ({
    data: {
      data: {
        id: 'userId',
        attributes: {
          first_name: 'Jane',
          last_name: 'Doe',
          bio_multiloc: { en: '<p>My bio</p>' },
          created_at: '2022-10-22T00:00:00.000Z',
        },
      },
    },
  }))
);

let mockUserId = 'userId';

jest.mock('hooks/useAuthUser', () => {
  return () => ({
    id: mockUserId,
  });
});

let mockDisableUsersBiosValue = false;

jest.mock('hooks/useFeatureFlag', () => {
  return () => mockDisableUsersBiosValue;
});

describe('UserHeader', () => {
  it('displays correctly', () => {
    render(<UserHeader userSlug="user-slug" />);
    expect(screen.getByTestId('userHeader')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(
      screen.getByText('Member since October 22, 2022')
    ).toBeInTheDocument();
  });

  it('renders edit button link when it is a personal profile', () => {
    render(<UserHeader userSlug="user-slug" />);
    expect(screen.getByText('Edit my profile')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/en/profile/edit'
    );
  });
  it('does not render edit button when it is a different user profile', () => {
    mockUserId = 'differentUserId';
    render(<UserHeader userSlug="user-slug" />);
    expect(screen.queryByText('Edit my profile')).not.toBeInTheDocument();
  });

  it('shows bio when disable_user_bios is false', () => {
    render(<UserHeader userSlug="user-slug" />);
    expect(screen.getByTestId('userHeaderBio')).toBeInTheDocument();
  });

  it('hides bio when disable_user_bios is true', () => {
    mockDisableUsersBiosValue = true;
    render(<UserHeader userSlug="user-slug" />);
    expect(screen.queryByTestId('userHeaderBio')).not.toBeInTheDocument();
  });
});
