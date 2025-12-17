import React from 'react';

import { makeUser } from 'api/users/__mocks__/useUsers';
import { IUser } from 'api/users/types';

import { render, fireEvent, waitFor, screen } from 'utils/testUtils/rtl';

import UnblockUserModal from './UnblockUser';

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (content) => content,
}));

const getElementById = document.getElementById.bind(document);
document.getElementById = (id, ...args) => {
  if (id === 'modal-portal') return true;
  return getElementById(id, ...args);
};
const user: IUser = makeUser();

const mockMutate = jest.fn();
jest.mock('api/blocked_users/useUnblockUser', () =>
  jest.fn(() => ({ mutate: mockMutate, reset: jest.fn() }))
);

it('Unblock a user', async () => {
  render(<UnblockUserModal setClose={() => {}} user={user.data} />);

  fireEvent.click(screen.getByTestId('unblockBtn'));

  await waitFor(() =>
    expect(mockMutate).toHaveBeenCalledWith(user.data.id, {
      onSuccess: expect.any(Function),
    })
  );
});
