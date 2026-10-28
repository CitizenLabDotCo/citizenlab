import React from 'react';

import { makeUser } from 'api/users/__mocks__/useUsers';
import { IUserData } from 'api/users/types';

import { render, screen } from 'utils/testUtils/rtl';

import UsersTableRow from '.';

// The JOINED cell is what this suite is about; the other cells pull in auth,
// feature flags and mutations that say nothing about the date logic.
jest.mock('components/admin/UsersTable/NameAvatarEmail', () => () => null);
jest.mock('components/admin/UsersTable/UserRole', () => () => null);
jest.mock('components/admin/UsersTable/ActionsMenu', () => () => null);

const renderRow = (attributes: Partial<IUserData['attributes']>) =>
  render(
    <table>
      <tbody>
        <UsersTableRow
          userInRow={makeUser(attributes).data}
          selected={false}
          toggleSelect={jest.fn()}
        />
      </tbody>
    </table>
  );

describe('UsersTableRow', () => {
  it('shows the registration date when the user completed registration', () => {
    renderRow({ registration_completed_at: '2026-10-12T09:00:00.000Z' });

    expect(screen.getByText('October 12, 2026')).toBeInTheDocument();
  });

  it('shows "Invitation pending" for a user who has not accepted their invite', () => {
    renderRow({ invite_status: 'pending', registration_completed_at: null });

    expect(screen.getByText('Invitation pending')).toBeInTheDocument();
  });

  // A user can have no invite and still never finish registering.
  it('shows "Registration not completed" when there is no date and no pending invite', () => {
    renderRow({ invite_status: null, registration_completed_at: null });

    expect(screen.getByText('Registration not completed')).toBeInTheDocument();
    expect(screen.queryByText('Invalid date')).not.toBeInTheDocument();
  });
});
