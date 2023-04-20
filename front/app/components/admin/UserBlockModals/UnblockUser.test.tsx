import React from 'react';
import { render, fireEvent, waitFor, screen } from 'utils/testUtils/rtl';
import UnblockUserModal from './UnblockUser';
import { makeUser } from 'services/__mocks__/users';
import { IUser } from 'services/users';

const user: IUser = makeUser();

const mockMutate = jest.fn();
jest.mock('api/blocked_users/useUnblockUser', () =>
  jest.fn(() => ({ mutate: mockMutate, reset: jest.fn() }))
);

it('Unblock a user', async () => {
  render(<UnblockUserModal open={true} setClose={() => {}} user={user.data} />);

  fireEvent.click(screen.getByTestId('unblockBtn'));

  await waitFor(() =>
    expect(mockMutate).toHaveBeenCalledWith(user.data.id, {
      onSuccess: expect.any(Function),
    })
  );
});
