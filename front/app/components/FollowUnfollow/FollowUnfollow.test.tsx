import React from 'react';
import { render, screen, waitFor, userEvent } from 'utils/testUtils/rtl';
import { mockAuthUserData } from 'api/me/__mocks__/_mockServer';
import FollowUnfollow from './index';
import { IUser } from 'api/users/types';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

let mockAuthUser: IUser | undefined = { data: mockAuthUserData };
jest.mock('api/me/useAuthUser', () => () => ({
  data: mockAuthUser,
}));

const mockAddFollower = jest.fn();
jest.mock('api/follow_unfollow/useAddFollower', () =>
  jest.fn(() => ({ mutate: mockAddFollower, reset: jest.fn() }))
);

const mockDeleteFollower = jest.fn();
jest.mock('api/follow_unfollow/useDeleteFollower', () =>
  jest.fn(() => ({ mutate: mockDeleteFollower, reset: jest.fn() }))
);

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

jest.mock('containers/Authentication/events', () => ({
  triggerAuthenticationFlow: jest.fn(),
}));

describe('FollowUnfollow', () => {
  it('renders the component', () => {
    render(
      <FollowUnfollow
        followableType="projects"
        followableId="1"
        followersCount={42}
      />
    );
    const followButton = screen.getByText('Follow (42)');
    expect(followButton).toBeInTheDocument();
  });

  it('calls addFollower when following', async () => {
    const user = userEvent.setup();
    render(
      <FollowUnfollow
        followableType="projects"
        followableId="1"
        followersCount={42}
      />
    );
    const followButton = screen.getByText('Follow (42)');

    await user.click(followButton);
    await waitFor(() => expect(mockAddFollower).toHaveBeenCalled());
  });

  it('calls deleteFollower when unfollowing', async () => {
    const user = userEvent.setup();
    render(
      <FollowUnfollow
        followableType="projects"
        followableId="1"
        followersCount={42}
        followerId="follower-1"
      />
    );
    const unfollowButton = screen.getByText('Unfollow (42)');

    await user.click(unfollowButton);
    await waitFor(() => expect(mockDeleteFollower).toHaveBeenCalled());
  });

  it('triggers authentication flow when user is not logged in', async () => {
    mockAuthUser = undefined;
    const user = userEvent.setup();

    render(
      <FollowUnfollow
        followableType="projects"
        followableId="1"
        followersCount={42}
      />
    );
    const followButton = screen.getByText('Follow (42)');

    await user.click(followButton);
    await waitFor(() =>
      expect(triggerAuthenticationFlow).toHaveBeenCalledWith({
        flow: 'signup',
        context: { type: 'follow', action: 'following' },
        successAction: {
          name: 'follow',
          params: { followableType: 'projects', followableId: '1' },
        },
      })
    );
  });
});
