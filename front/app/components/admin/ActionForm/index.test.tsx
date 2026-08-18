import React from 'react';

import { IdMethodData } from 'api/id_methods/types';
import { IPermissionData } from 'api/permissions/types';

import { render, screen, within, userEvent } from 'utils/testUtils/rtl';

import ActionForm from '.';

const ssoMethod = {
  id: 'method-1',
  type: 'id_method',
  attributes: {
    name: 'fake_sso',
    authentication_method: true,
    verification_method: false,
    method_metadata: { name: 'ItsMe' },
  },
} as IdMethodData;

// A sign-in method that may sign someone up without an email address, which is
// what makes the email requirement configurable.
const emaillessSsoMethod = {
  ...ssoMethod,
  attributes: {
    ...ssoMethod.attributes,
    method_metadata: { name: 'ItsMe', email_always_present: false },
  },
} as IdMethodData;

// The combination of platform config the panel reacts to.
let mockPasswordLoginEnabled = true;
let mockIdMethods: IdMethodData[] = [ssoMethod];
let mockVerificationMethodConfigured = true;

jest.mock('hooks/useFeatureFlag', () =>
  jest.fn(({ name }: { name: string }) =>
    name === 'password_login' ? mockPasswordLoginEnabled : false
  )
);

jest.mock('api/id_methods/useIdMethods', () =>
  jest.fn(() => ({ data: { data: mockIdMethods } }))
);

jest.mock('api/id_methods/useVerificationMethod', () =>
  jest.fn(() => ({
    data: mockVerificationMethodConfigured
      ? { data: { attributes: { method_metadata: { name: 'ItsMe' } } } }
      : null,
  }))
);

jest.mock('api/phases/usePhase', () =>
  jest.fn(() => ({
    data: { data: { attributes: { participation_method: 'ideation' } } },
  }))
);

jest.mock(
  'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields',
  () => jest.fn(() => ({ data: { data: [] } }))
);

// Leaf sections with their own data dependencies, orthogonal to what we test.
jest.mock(
  'components/admin/ActionForm/AccessSection/GroupsSection',
  () => () => null
);
jest.mock(
  'components/admin/ActionForm/AccessSection/IdMethodsModal',
  () => () => null
);
jest.mock(
  'components/admin/ActionForm/DataSection/DemographicSection',
  () => () => null
);
jest.mock(
  'components/admin/ActionForm/DataSection/AnonymitySection',
  () => () => null
);

const buildPermission = (
  attributes: Partial<IPermissionData['attributes']> = {}
): IPermissionData =>
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
      permitted_by_everyone_allowed: false,
      inherited: false,
      ...attributes,
    },
    relationships: {
      permission_scope: { data: { id: 'ph-1', type: 'phase' } },
      groups: { data: [] },
    },
  } as IPermissionData);

type RenderOptions = {
  defaultOpen?: boolean;
  onOverride?: () => Promise<void>;
  onRevertToDefaults?: () => Promise<void>;
};

const renderForm = (
  attributes?: Partial<IPermissionData['attributes']>,
  { defaultOpen = true, onOverride, onRevertToDefaults }: RenderOptions = {}
) =>
  render(
    <ActionForm
      phaseId="ph-1"
      permissionData={buildPermission(attributes)}
      title="Commenting"
      defaultOpen={defaultOpen}
      onChange={jest.fn()}
      onOverride={onOverride}
      onRevertToDefaults={onRevertToDefaults}
    />
  );

beforeEach(() => {
  mockPasswordLoginEnabled = true;
  mockIdMethods = [ssoMethod];
  mockVerificationMethodConfigured = true;
});

describe('<ActionForm />', () => {
  describe('the access section', () => {
    it('offers the security checks whatever the sign-in methods are', () => {
      renderForm();
      expect(screen.getByText('Security requirements')).toBeInTheDocument();
      expect(
        screen.getByText('Participants sign in with email, Fake SSO.')
      ).toBeInTheDocument();
    });

    it('keeps the same section when password login is off', () => {
      mockPasswordLoginEnabled = false;
      renderForm();
      // Only the SSO method is a way in, but the security checks are still
      // there to be required.
      expect(
        screen.getByText('Participants sign in with Fake SSO.')
      ).toBeInTheDocument();
      expect(screen.getByText('Security requirements')).toBeInTheDocument();
    });
  });

  describe('admins & managers only', () => {
    it('does not render the data section and shows the staff-only hint', () => {
      renderForm({ permitted_by: 'admins_moderators' });
      expect(screen.queryByText('What we collect')).not.toBeInTheDocument();
      expect(
        screen.getByText(/Only admins and managers can take this action/i)
      ).toBeInTheDocument();
    });
  });

  describe('collapsed summary chips', () => {
    it('summarises the enabled methods and collected fields', () => {
      renderForm(
        {
          require_name: true,
          require_password: true,
          require_verification: true,
        },
        { defaultOpen: false }
      );
      // Body is not rendered when collapsed; only the summary chips are.
      expect(screen.queryByText('What we collect')).not.toBeInTheDocument();
      expect(screen.getByText('Sign-in required')).toBeInTheDocument();
      expect(screen.getByText('Verification')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
    });

    it('chips a security requirement the platform offers', () => {
      // Only a sign-in method that may leave someone without an email makes
      // the email requirement configurable here (SMS is off).
      mockIdMethods = [emaillessSsoMethod];
      renderForm({ require_confirmed_email: true }, { defaultOpen: false });

      expect(screen.getByText('Confirmed email')).toBeInTheDocument();
    });

    it('leaves out a security requirement the platform does not offer', () => {
      // The permission still carries the flags, but neither requirement can be
      // configured: SMS is off and no verification method is set up.
      mockVerificationMethodConfigured = false;
      renderForm(
        { require_confirmed_email: true, require_verification: true },
        { defaultOpen: false }
      );

      expect(screen.queryByText('Confirmed email')).not.toBeInTheDocument();
      expect(screen.queryByText('Verification')).not.toBeInTheDocument();
      expect(screen.getByText('Sign-in required')).toBeInTheDocument();
    });

    it('shows the open-access chip when anyone can participate', () => {
      renderForm({ permitted_by: 'everyone' }, { defaultOpen: false });
      expect(screen.getByText('Anyone can participate')).toBeInTheDocument();
    });
  });

  describe('password tooltip integration', () => {
    it('surfaces the "email sign-up only" tooltip when an SSO method is enabled', async () => {
      renderForm();

      await userEvent.click(screen.getByText('Personal info'));
      const passwordRow = screen.getByText('Password').parentElement!;
      await userEvent.hover(
        within(passwordRow).getByTestId('tooltip-icon-button')
      );

      expect(
        await screen.findByText(
          /only requested from users who sign up with email/i
        )
      ).toBeInTheDocument();
    });

    it('does not surface the password tooltip when there is no SSO method', async () => {
      mockIdMethods = [];
      renderForm();

      await userEvent.click(screen.getByText('Personal info'));
      const passwordRow = screen.getByText('Password').parentElement!;
      expect(
        within(passwordRow).queryByTestId('tooltip-icon-button')
      ).not.toBeInTheDocument();
    });
  });

  describe('inheriting the platform defaults', () => {
    it('locks the panel shut and offers to override it', () => {
      renderForm({ inherited: true }, { onOverride: jest.fn() });

      expect(screen.getByText('Commenting')).toBeInTheDocument();
      expect(screen.getByText(/Using/)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Override' })
      ).toBeInTheDocument();
      // Nothing is configurable until the action has been overridden.
      expect(
        screen.queryByText('Security requirements')
      ).not.toBeInTheDocument();
      expect(screen.queryByText('What we collect')).not.toBeInTheDocument();
    });

    it('overrides the action and opens the panel', async () => {
      const onOverride = jest.fn().mockResolvedValue(undefined);
      renderForm({ inherited: true }, { onOverride });

      await userEvent.click(screen.getByRole('button', { name: 'Override' }));
      expect(onOverride).toHaveBeenCalledTimes(1);
    });

    it('renders the regular panel when the action has been overridden', () => {
      renderForm({ inherited: false }, { onOverride: jest.fn() });

      expect(screen.getByText('Security requirements')).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Override' })
      ).not.toBeInTheDocument();
    });

    it('renders the regular panel when the caller does not support overriding', () => {
      renderForm({ inherited: true });

      expect(screen.getByText('Security requirements')).toBeInTheDocument();
    });
  });

  describe('reverting to the platform defaults', () => {
    it('asks for confirmation before discarding the action settings', async () => {
      const onRevertToDefaults = jest.fn().mockResolvedValue(undefined);
      renderForm(undefined, { onRevertToDefaults });

      await userEvent.click(
        screen.getByRole('button', { name: 'Revert to platform defaults' })
      );

      expect(
        screen.getByText('Revert to platform defaults?')
      ).toBeInTheDocument();
      expect(screen.getByText(/will be discarded/i)).toBeInTheDocument();
      expect(onRevertToDefaults).not.toHaveBeenCalled();

      await userEvent.click(screen.getByRole('button', { name: 'Revert' }));
      expect(onRevertToDefaults).toHaveBeenCalledTimes(1);
    });

    it('does not offer reverting when the caller does not support it', () => {
      renderForm();

      expect(
        screen.queryByRole('button', { name: 'Revert to platform defaults' })
      ).not.toBeInTheDocument();
    });
  });
});
