import React from 'react';

import { IdMethodData } from 'api/id_methods/types';
import { permissionData } from 'api/permissions/__mocks__/usePermission';
import { IPermissionData } from 'api/permissions/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import VisitingPermission from '.';

const verificationMethod = {
  id: 'method-1',
  type: 'id_method',
  attributes: {
    name: 'fake_sso',
    authentication_method: false,
    verification_method: true,
    method_metadata: { name: 'ItsMe' },
  },
} as IdMethodData;

let mockPermission: IPermissionData | undefined = permissionData;
const mockUpdatePermission = jest.fn();

jest.mock('api/permissions/usePermission', () =>
  jest.fn(() => ({
    data: mockPermission ? { data: mockPermission } : undefined,
  }))
);

jest.mock('api/permissions/useUpdatePermission', () =>
  jest.fn(() => ({ mutate: mockUpdatePermission }))
);

jest.mock('hooks/useFeatureFlag', () =>
  jest.fn(({ name }: { name: string }) => name === 'password_login')
);

jest.mock('api/id_methods/useIdMethods', () =>
  jest.fn(() => ({ data: { data: [verificationMethod] } }))
);

jest.mock('api/id_methods/useVerificationMethod', () =>
  jest.fn(() => ({ data: { data: verificationMethod } }))
);

jest.mock('api/groups/useGroups', () =>
  jest.fn(() => ({ data: { data: [] } }))
);

beforeEach(() => {
  mockPermission = permissionData;
});

describe.skip('<VisitingPermission />', () => {
  it('renders nothing while the permission is loading', () => {
    mockPermission = undefined;
    render(<VisitingPermission />);
    expect(screen.queryByText('Platform access')).not.toBeInTheDocument();
  });

  it('shows the sections that apply to visiting the platform', () => {
    render(<VisitingPermission />);

    expect(screen.getByText('Security requirements')).toBeInTheDocument();
    expect(screen.getByText('Personal info')).toBeInTheDocument();
  });

  it('saves a security requirement against the visiting permission', async () => {
    render(<VisitingPermission />);

    await userEvent.click(screen.getByText('Security requirements'));
    await userEvent.click(
      screen.getByText('Require identity verification from all participants')
    );

    expect(mockUpdatePermission).toHaveBeenCalledWith({
      action: 'visiting',
      permission: { require_verification: true, verification_expiry: null },
    });
  });

  it('saves a personal info change against the visiting permission', async () => {
    render(<VisitingPermission />);

    await userEvent.click(screen.getByText('Personal info'));
    await userEvent.click(screen.getByText('Full name'));

    expect(mockUpdatePermission).toHaveBeenCalledWith({
      action: 'visiting',
      permission: { require_name: false },
    });
  });
});
