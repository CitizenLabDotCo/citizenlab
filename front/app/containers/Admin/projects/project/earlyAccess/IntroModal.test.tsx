import React from 'react';

import { IUser } from 'api/users/types';

import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import IntroModal from './IntroModal';
import { buildEarlyAccessUser } from './testUser';

let mockAuthUser: IUser | undefined;
jest.mock('api/me/useAuthUser', () => () => ({ data: mockAuthUser }));

const mockUpdateUser = jest.fn();
jest.mock('api/users/useUpdateUser', () => () => ({
  mutate: mockUpdateUser,
  isPending: false,
  isError: false,
}));

const mockDecline = jest.fn();
jest.mock('api/me/useDeclineEarlyAccess', () => () => ({
  mutate: mockDecline,
}));

describe('IntroModal', () => {
  beforeEach(() => {
    mockUpdateUser.mockClear();
    mockDecline.mockClear();
  });

  it('does not show before the invitation is due again', () => {
    mockAuthUser = buildEarlyAccessUser({});
    render(<IntroModal />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('turns the new back office on from "Enable"', () => {
    mockAuthUser = buildEarlyAccessUser({
      promptsDue: ['project_backoffice_redesign'],
    });
    render(<IntroModal />);

    expect(
      screen.getByRole('heading', {
        name: 'Introducing the new project back office',
      })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Enable' }));
    expect(mockUpdateUser).toHaveBeenCalledWith(
      {
        userId: 'user-id',
        early_access_opt_ins: ['project_backoffice_redesign'],
      },
      expect.anything()
    );
  });

  it('records "Not now" and closes', () => {
    mockAuthUser = buildEarlyAccessUser({
      promptsDue: ['project_backoffice_redesign'],
    });
    render(<IntroModal />);

    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));

    expect(mockDecline).toHaveBeenCalledWith('project_backoffice_redesign');
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });
});
