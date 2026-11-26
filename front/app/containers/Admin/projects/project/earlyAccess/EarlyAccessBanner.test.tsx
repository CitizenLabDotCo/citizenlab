import React from 'react';

import { IUser } from 'api/users/types';

import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import EarlyAccessBanner from './EarlyAccessBanner';
import { buildEarlyAccessUser } from './testUser';

let mockAuthUser: IUser | undefined;
jest.mock('api/me/useAuthUser', () => () => ({ data: mockAuthUser }));

const mockUpdateUser = jest.fn();
jest.mock('api/users/useUpdateUser', () => () => ({
  mutate: mockUpdateUser,
  isPending: false,
  isError: false,
}));

describe('EarlyAccessBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUpdateUser.mockClear();
  });

  it('offers the new back office with a switch, in the previous version', () => {
    mockAuthUser = buildEarlyAccessUser({});
    render(<EarlyAccessBanner />);

    expect(
      screen.getByText(/Try the new project back office\./)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'New project back office' })
    ).not.toBeChecked();
    expect(
      screen.getByRole('link', { name: 'profile settings' })
    ).toBeInTheDocument();
  });

  it('renders nothing for a user it is not offered to', () => {
    mockAuthUser = buildEarlyAccessUser({ offered: {} });
    render(<EarlyAccessBanner />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('says how to go back, in the new version', () => {
    mockAuthUser = buildEarlyAccessUser({
      optedIn: ['project_backoffice_redesign'],
    });
    render(<EarlyAccessBanner />);

    expect(
      screen.getByText(
        /You are using the new project back office\. To go back to the previous version, turn it off here or in your/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: 'New project back office' })
    ).toBeChecked();
  });

  it('tells Go Vocal staff the early access is internal', () => {
    mockAuthUser = buildEarlyAccessUser({
      offered: { project_backoffice_redesign: 'internal' },
      highestRole: 'super_admin',
    });
    render(<EarlyAccessBanner />);

    expect(
      screen.getByText(/in early access for Go Vocal staff only/)
    ).toBeInTheDocument();
  });

  it('warns that unsaved changes are lost before turning it on', () => {
    mockAuthUser = buildEarlyAccessUser({});
    render(<EarlyAccessBanner />);

    fireEvent.click(
      screen.getByRole('switch', { name: 'New project back office' })
    );
    expect(mockUpdateUser).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Turn on' }));
    expect(mockUpdateUser).toHaveBeenCalledWith(
      {
        userId: 'user-id',
        early_access_opt_ins: ['project_backoffice_redesign'],
      },
      expect.anything()
    );
  });

  it('stays dismissed once closed', () => {
    mockAuthUser = buildEarlyAccessUser({});
    const { unmount } = render(<EarlyAccessBanner />);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(
      screen.queryByText(/Try the new project back office\./)
    ).not.toBeInTheDocument();

    unmount();
    render(<EarlyAccessBanner />);
    expect(
      screen.queryByText(/Try the new project back office\./)
    ).not.toBeInTheDocument();
  });
});
