import React from 'react';

import { makeUser } from 'api/users/__mocks__/useUsers';
import { IUser } from 'api/users/types';

import { render, fireEvent, waitFor } from 'utils/testUtils/rtl';

import BlockUserModal from './BlockUser';

const user: IUser = makeUser();

const mockMutate = jest.fn();
jest.mock('api/blocked_users/useBlockUser', () =>
  jest.fn(() => ({ mutate: mockMutate, reset: jest.fn() }))
);

it('Block a user with a reason', async () => {
  const reason = 'Blocking reason.';

  const { container } = render(
    <BlockUserModal open={true} setClose={() => {}} user={user.data} />
  );

  fireEvent.input(container.querySelector('textarea'), {
    target: {
      value: reason,
    },
  });
  fireEvent.click(container.querySelector('button[type="submit"]'));

  await waitFor(() =>
    expect(mockMutate).toHaveBeenCalledWith(
      {
        userId: user.data.id,
        reason,
      },
      {
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }
    )
  );
});
