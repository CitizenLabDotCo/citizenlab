import React from 'react';

import { makeUser } from 'api/users/__mocks__/useUsers';
import { IUser } from 'api/users/types';

import { render, fireEvent, waitFor, screen } from 'utils/testUtils/rtl';

import ClearEmailBounceModal from './ClearEmailBounceModal';

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (content) => content,
}));

const getElementById = document.getElementById.bind(document);
document.getElementById = (id, ...args) => {
  if (id === 'modal-portal') return true;
  return getElementById(id, ...args);
};
const user: IUser = makeUser({
  email: 'bounced@example.com',
  email_bounced_at: '2026-10-02T14:17:33Z',
  email_bounce_reason: '550 5.1.1 User unknown',
});

const mockMutate = jest.fn();
jest.mock('api/email_bounced_users/useClearEmailBounce', () =>
  jest.fn(() => ({ mutate: mockMutate, isPending: false }))
);

it('shows the bounce reason and clears the bounce', async () => {
  render(
    <ClearEmailBounceModal
      user={user.data}
      email="bounced@example.com"
      bouncedAt="2026-10-02T14:17:33Z"
      setClose={() => {}}
    />
  );

  expect(screen.getByText(/550 5.1.1 User unknown/)).toBeInTheDocument();

  fireEvent.click(screen.getByTestId('clearEmailBounceBtn'));

  await waitFor(() =>
    expect(mockMutate).toHaveBeenCalledWith(user.data.id, {
      onSuccess: expect.any(Function),
    })
  );
});
