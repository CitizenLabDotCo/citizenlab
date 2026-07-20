import React from 'react';

import { IPhasePermissionData } from 'api/phase_permissions/types';

import { render, screen } from 'utils/testUtils/rtl';

import AccessSectionSSO from '.';

// The SSO variant reads the single enabled authentication (SSO) method to name
// the fixed sign-in method. `null` models "no SSO method configured".
let mockAuthenticationMethod: unknown = {
  data: { attributes: { method_metadata: { name: 'ItsMe' } } },
};

jest.mock('api/id_methods/useAuthenticationMethod', () =>
  jest.fn(() => ({ data: mockAuthenticationMethod }))
);

jest.mock(
  'components/admin/ActionForm/AccessSections/GroupsSection',
  () => () => null
);
jest.mock(
  'components/admin/ActionForm/AccessSections/VerificationFieldsModal',
  () => () => null
);

const buildPermission = (
  attributes: Partial<IPhasePermissionData['attributes']> = {}
): IPhasePermissionData =>
  ({
    id: 'perm-1',
    type: 'permission',
    attributes: {
      action: 'commenting_idea',
      permitted_by: 'users',
      global_custom_fields: false,
      verification_expiry: null,
      access_denied_explanation_multiloc: {},
      everyone_tracking_enabled: false,
      user_data_collection: 'all_data',
      require_confirmed_email: true,
      confirmed_email_expiry: null,
      require_name: true,
      require_password: true,
      require_verification: false,
      permitted_by_everyone_allowed: true,
      ...attributes,
    },
    relationships: {
      permission_scope: { data: { id: 'ph-1', type: 'phase' } },
      groups: { data: [] },
    },
  } as IPhasePermissionData);

const renderSection = (
  attributes?: Partial<IPhasePermissionData['attributes']>
) =>
  render(
    <AccessSectionSSO
      permission={buildPermission(attributes)}
      showAnyone
      onChange={jest.fn()}
    />
  );

beforeEach(() => {
  mockAuthenticationMethod = {
    data: { attributes: { method_metadata: { name: 'ItsMe' } } },
  };
});

describe('<AccessSectionSSO />', () => {
  it('renders the "Who can participate" header', () => {
    renderSection();
    expect(screen.getByText('Who can participate')).toBeInTheDocument();
  });

  describe('when an account is required (permitted_by: users)', () => {
    it('names the configured SSO method as the fixed sign-in method', () => {
      renderSection();
      expect(
        screen.getByText('Participants sign in with ItsMe.')
      ).toBeInTheDocument();
    });

    it('still renders the sign-in row when no SSO method is configured', () => {
      // The endpoint returns 204 -> fetcher yields null -> the hook's data is null.
      mockAuthenticationMethod = null;
      renderSection();
      // methodName falls back to an empty string, but the row is still shown.
      expect(screen.getByText(/Participants sign in with/)).toBeInTheDocument();
    });
  });

  describe('when no account is required (permitted_by: everyone)', () => {
    it('does not show the fixed sign-in method row', () => {
      renderSection({ permitted_by: 'everyone' });
      expect(
        screen.queryByText(/Participants sign in with/)
      ).not.toBeInTheDocument();
    });
  });
});
