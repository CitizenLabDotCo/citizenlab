import React from 'react';

import { IPhasePermissionData } from 'api/phase_permissions/types';

import { render, screen, within, userEvent } from 'utils/testUtils/rtl';

import DataSection from '.';

// PersonalInfoSection (rendered for account permissions) reads these two hooks:
// password login toggles whether the password row exists at all, and the SSO
// authentication method drives the "only asked to email sign-ups" tooltip.
let mockPasswordLoginEnabled = true;
let mockAuthenticationMethod: unknown = {
  data: { attributes: { method_metadata: { name: 'ItsMe' } } },
};
// DataSection itself only shows the anonymity section for native survey posting.
let mockParticipationMethod = 'ideation';

jest.mock('hooks/useFeatureFlag', () =>
  jest.fn(({ name }: { name: string }) =>
    name === 'password_login' ? mockPasswordLoginEnabled : false
  )
);

jest.mock('api/id_methods/useAuthenticationMethod', () =>
  jest.fn(() => ({ data: mockAuthenticationMethod }))
);

jest.mock('api/phases/usePhase', () =>
  jest.fn(() => ({
    data: { data: { attributes: { participation_method: mockParticipationMethod } } },
  }))
);

// Orthogonal children with their own data dependencies - stub them out.
jest.mock(
  'components/admin/ActionForm/DataSection/DemographicSection',
  () => () => null
);
jest.mock(
  'components/admin/ActionForm/DataSection/AnonymitySection',
  () => () => require('react').createElement('div', null, 'ANONYMITY_SECTION')
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
      permitted_by_everyone_allowed: false,
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
    <DataSection
      permission={buildPermission(attributes)}
      phaseId="ph-1"
      onChange={jest.fn()}
    />
  );

// The personal-info toggles live behind a collapsed "Personal info" expander.
const openPersonalInfo = async () =>
  userEvent.click(screen.getByText('Personal info'));

beforeEach(() => {
  mockPasswordLoginEnabled = true;
  mockAuthenticationMethod = {
    data: { attributes: { method_metadata: { name: 'ItsMe' } } },
  };
  mockParticipationMethod = 'ideation';
});

describe('<DataSection />', () => {
  it('always renders the "What we collect" header', () => {
    renderSection();
    expect(screen.getByText('What we collect')).toBeInTheDocument();
  });

  describe('personal info', () => {
    it('is shown for account permissions (permitted_by: users)', async () => {
      renderSection();
      expect(screen.getByText('Personal info')).toBeInTheDocument();

      await openPersonalInfo();
      expect(screen.getByText('Full name')).toBeInTheDocument();
      expect(screen.getByText('Password')).toBeInTheDocument();
    });

    it('is hidden when no account is required (permitted_by: everyone)', () => {
      renderSection({ permitted_by: 'everyone' });
      expect(screen.queryByText('Personal info')).not.toBeInTheDocument();
    });

    it('hides the password toggle when password login is disabled', async () => {
      mockPasswordLoginEnabled = false;
      renderSection();

      await openPersonalInfo();
      expect(screen.getByText('Full name')).toBeInTheDocument();
      expect(screen.queryByText('Password')).not.toBeInTheDocument();
    });

    it('shows the "only asked to email sign-ups" tooltip when an SSO method is enabled', async () => {
      renderSection();
      await openPersonalInfo();

      const passwordRow = screen.getByText('Password').parentElement!;
      const tooltip = within(passwordRow).getByTestId('tooltip-icon-button');
      await userEvent.hover(tooltip);

      expect(
        await screen.findByText(
          /only requested from users who sign up with email/i
        )
      ).toBeInTheDocument();
    });

    it('does not show the password tooltip when there is no SSO method', async () => {
      mockAuthenticationMethod = null;
      renderSection();
      await openPersonalInfo();

      const passwordRow = screen.getByText('Password').parentElement!;
      expect(
        within(passwordRow).queryByTestId('tooltip-icon-button')
      ).not.toBeInTheDocument();
    });
  });

  describe('anonymity section', () => {
    it('is shown for native survey submissions', () => {
      mockParticipationMethod = 'native_survey';
      renderSection({ action: 'posting_idea' });
      expect(screen.getByText('ANONYMITY_SECTION')).toBeInTheDocument();
    });

    it('is hidden for non-survey actions', () => {
      mockParticipationMethod = 'native_survey';
      renderSection({ action: 'commenting_idea' });
      expect(screen.queryByText('ANONYMITY_SECTION')).not.toBeInTheDocument();
    });

    it('is hidden for non-survey participation methods', () => {
      mockParticipationMethod = 'ideation';
      renderSection({ action: 'posting_idea' });
      expect(screen.queryByText('ANONYMITY_SECTION')).not.toBeInTheDocument();
    });
  });
});
