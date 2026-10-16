import React from 'react';

import { IUserData } from 'api/users/types';

import { render, screen } from 'utils/testUtils/rtl';

import UsersTableRow from '.';

// The JOINED cell is what this suite is about; the other cells pull in auth,
// feature flags and mutations that say nothing about the date logic.
jest.mock('components/admin/UsersTable/NameAvatarEmail', () => () => null);
jest.mock('components/admin/UsersTable/UserRole', () => () => null);
jest.mock('components/admin/UsersTable/ActionsMenu', () => () => null);

const user = (attributes: Partial<IUserData['attributes']>): IUserData =>
  ({
    id: 'e1a4f0a8-0a07-4a6e-9f6e-2a3b6f9d0c11',
    type: 'user',
    attributes: {
      first_name: 'Jane',
      last_name: 'Doe',
      locale: 'en',
      bio_multiloc: {},
      invite_status: null,
      registration_completed_at: null,
      created_at: '2026-10-01T09:00:00.000Z',
      updated_at: '2026-10-01T09:00:00.000Z',
      unread_notifications: 0,
      confirmation_required: false,
      followings_count: 0,
      ...attributes,
    },
  } as IUserData);

const renderRow = (userInRow: IUserData) =>
  render(
    <table>
      <tbody>
        <UsersTableRow
          userInRow={userInRow}
          selected={false}
          toggleSelect={jest.fn()}
        />
      </tbody>
    </table>
  );

describe('UsersTableRow', () => {
  it('shows the registration date when the user completed registration', () => {
    renderRow(user({ registration_completed_at: '2026-10-12T09:00:00.000Z' }));

    expect(screen.getByText('October 12, 2026')).toBeInTheDocument();
  });

  it('shows "Invitation pending" for a user who has not accepted their invite', () => {
    renderRow(
      user({ invite_status: 'pending', registration_completed_at: null })
    );

    expect(screen.getByText('Invitation pending')).toBeInTheDocument();
  });

  // Regression: this case used to fall through to the date branch and render
  // "Invalid date", because the condition tested invite_status instead of the
  // date itself. A user can have no invite and still never finish registering.
  it('shows "Registration not completed" when there is no date and no pending invite', () => {
    renderRow(user({ invite_status: null, registration_completed_at: null }));

    expect(screen.getByText('Registration not completed')).toBeInTheDocument();
    expect(screen.queryByText('Invalid date')).not.toBeInTheDocument();
  });
});
