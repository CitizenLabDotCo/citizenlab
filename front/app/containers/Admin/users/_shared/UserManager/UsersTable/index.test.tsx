import React from 'react';

import { makeUser } from 'api/users/__mocks__/useUsers';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import UsersTable from '.';

jest.mock('./UsersTableRow', () => () => null);

const usersList = [makeUser().data];

const renderTable = (
  sort: 'registration_completed_at' | '-registration_completed_at',
  onChangeSorting: jest.Mock
) =>
  render(
    <UsersTable
      usersList={usersList}
      sort={sort}
      currentPage={1}
      lastPage={1}
      selectedUsers="none"
      handleSelect={jest.fn()}
      onChangePage={jest.fn()}
      onChangeSorting={onChangeSorting}
    />
  );

const clickJoinedHeader = async () => {
  const header = screen.getByText('Joined').closest('th');
  if (!header) throw new Error('Joined header not found');
  await userEvent.click(header);
};

describe('UsersTable', () => {
  it('asks for an ascending registration_completed_at sort when currently descending', async () => {
    const onChangeSorting = jest.fn();
    renderTable('-registration_completed_at', onChangeSorting);

    await clickJoinedHeader();

    expect(onChangeSorting).toHaveBeenCalledWith('registration_completed_at');
  });

  it('asks for a descending registration_completed_at sort when currently ascending', async () => {
    const onChangeSorting = jest.fn();
    renderTable('registration_completed_at', onChangeSorting);

    await clickJoinedHeader();

    expect(onChangeSorting).toHaveBeenCalledWith('-registration_completed_at');
  });
});
