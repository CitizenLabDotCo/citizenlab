import React from 'react';

import { IPhasePermissionData } from 'api/phase_permissions/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import DemographicSection from '.';

// `permissions_custom_fields` is the paid feature that gates this whole section.
let mockPermissionsCustomFieldsAllowed = true;
jest.mock('hooks/useFeatureFlag', () =>
  jest.fn(({ name }: { name: string }) =>
    name === 'permissions_custom_fields'
      ? mockPermissionsCustomFieldsAllowed
      : false
  )
);

// The section reads the permission custom fields plus three mutation hooks -
// stub them so we can render without a backend.
jest.mock(
  'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields',
  () => jest.fn(() => ({ data: { data: [] } }))
);
jest.mock(
  'api/permissions_phase_custom_fields/useAddPermissionsPhaseCustomField',
  () => jest.fn(() => ({ mutate: jest.fn(), isLoading: false }))
);
jest.mock(
  'api/permissions_phase_custom_fields/useUpdatePermissionsPhaseCustomField',
  () => jest.fn(() => ({ mutate: jest.fn() }))
);
jest.mock(
  'api/permissions_phase_custom_fields/useDeletePermissionsPhaseCustomField',
  () => jest.fn(() => ({ mutate: jest.fn() }))
);

// Orthogonal children with their own data dependencies - stub them out.
jest.mock('./DemographicsPlacement', () => () => null);
jest.mock('./FieldSelectionModal', () => () => null);
jest.mock(
  './FieldsList',
  () => () => require('react').createElement('div', null, 'FIELDS_LIST')
);

const UPSELL_COPY = /This feature is not included in your current plan/i;

const buildPermission = (
  attributes: Partial<IPhasePermissionData['attributes']> = {}
): IPhasePermissionData =>
  ({
    id: 'perm-1',
    type: 'permission',
    attributes: {
      action: 'commenting_idea',
      permitted_by: 'users',
      user_fields_in_form_descriptor: {},
      ...attributes,
    },
    relationships: {
      permission_scope: { data: { id: 'ph-1', type: 'phase' } },
      groups: { data: [] },
    },
  } as unknown as IPhasePermissionData);

const renderSection = () =>
  render(
    <DemographicSection
      permission={buildPermission()}
      phaseId="ph-1"
      permissionHasForm={false}
      onChange={jest.fn()}
    />
  );

beforeEach(() => {
  mockPermissionsCustomFieldsAllowed = true;
});

describe('<DemographicSection />', () => {
  describe('when permissions_custom_fields is allowed', () => {
    it('renders an expandable, unlocked section', async () => {
      renderSection();

      // The section header is always shown...
      expect(screen.getByText('Demographic questions')).toBeInTheDocument();
      // ...and there is no lock tooltip.
      expect(
        screen.queryByTestId('tooltip-icon-button')
      ).not.toBeInTheDocument();

      // The controls are hidden until the row is expanded.
      expect(screen.queryByText('FIELDS_LIST')).not.toBeInTheDocument();

      await userEvent.click(screen.getByText('Demographic questions'));

      expect(screen.getByText('FIELDS_LIST')).toBeInTheDocument();
      expect(
        screen.getByText('Add a demographic question')
      ).toBeInTheDocument();
    });
  });

  describe('when permissions_custom_fields is NOT allowed', () => {
    beforeEach(() => {
      mockPermissionsCustomFieldsAllowed = false;
    });

    it('still shows the section header', () => {
      renderSection();
      expect(screen.getByText('Demographic questions')).toBeInTheDocument();
    });

    it('does not render any of the section controls', () => {
      renderSection();
      expect(screen.queryByText('FIELDS_LIST')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Add a demographic question')
      ).not.toBeInTheDocument();
    });

    it('cannot be expanded to reveal the controls', async () => {
      renderSection();

      await userEvent.click(screen.getByText('Demographic questions'));

      expect(screen.queryByText('FIELDS_LIST')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Add a demographic question')
      ).not.toBeInTheDocument();
    });

    it('shows a lock tooltip explaining it is not part of the pricing plan', async () => {
      renderSection();

      const tooltip = screen.getByTestId('tooltip-icon-button');
      await userEvent.hover(tooltip);

      expect(await screen.findByText(UPSELL_COPY)).toBeInTheDocument();
    });
  });
});
