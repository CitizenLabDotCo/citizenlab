import React from 'react';

import { IPermissionData } from 'api/permissions/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import DataSection from '.';

// DataSection only shows the anonymity section for survey posting (native
// survey and community monitor).
let mockParticipationMethod = 'ideation';

jest.mock('api/phases/usePhase', () =>
  jest.fn(() => ({
    data: {
      data: { attributes: { participation_method: mockParticipationMethod } },
    },
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
  attributes: Partial<IPermissionData['attributes']> = {}
): IPermissionData =>
  ({
    id: 'perm-1',
    type: 'permission',
    attributes: {
      action: 'commenting_idea',
      permitted_by: 'users',
      custom_fields_behavior: 'global',
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
  } as IPermissionData);

const renderSection = (attributes?: Partial<IPermissionData['attributes']>) =>
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
    });

    it('is hidden when no account is required (permitted_by: everyone)', () => {
      renderSection({ permitted_by: 'everyone' });
      expect(screen.queryByText('Personal info')).not.toBeInTheDocument();
    });

    it('summarises the name requirement while collapsed', () => {
      renderSection({ require_name: true });

      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  describe('anonymity section', () => {
    it('is shown for native survey submissions', () => {
      mockParticipationMethod = 'native_survey';
      renderSection({ action: 'posting_idea' });
      expect(screen.getByText('ANONYMITY_SECTION')).toBeInTheDocument();
    });

    it('is shown for community monitor survey submissions', () => {
      mockParticipationMethod = 'community_monitor_survey';
      renderSection({ action: 'posting_idea' });
      expect(screen.getByText('ANONYMITY_SECTION')).toBeInTheDocument();
    });

    it('is hidden for non-survey actions', () => {
      mockParticipationMethod = 'community_monitor_survey';
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
