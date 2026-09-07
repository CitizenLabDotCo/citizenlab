import React from 'react';

import { IPermissionData } from 'api/permissions/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import DemographicSection from '.';

// `permissions_custom_fields` is the paid feature that gates curating a list of
// questions. The other two behaviors are not gated.
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
  () => jest.fn(() => ({ mutate: jest.fn(), isPending: false }))
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
const GLOBAL_COPY = 'Use platform-wide demographic questions';
const DISABLED_COPY = "Don't ask demographic questions";
const CUSTOM_COPY = 'Customize which demographic questions should be asked';

const buildPermission = (
  attributes: Partial<IPermissionData['attributes']> = {}
): IPermissionData =>
  ({
    id: 'perm-1',
    type: 'permission',
    attributes: {
      action: 'commenting_idea',
      permitted_by: 'users',
      custom_fields_behavior: 'custom',
      user_fields_in_form_descriptor: {},
      ...attributes,
    },
    relationships: {
      permission_scope: { data: { id: 'ph-1', type: 'phase' } },
      groups: { data: [] },
    },
  } as unknown as IPermissionData);

const renderSection = (
  attributes: Partial<IPermissionData['attributes']> = {},
  onChange = jest.fn()
) =>
  render(
    <DemographicSection
      permission={buildPermission(attributes)}
      phaseId="ph-1"
      permissionHasForm={false}
      onChange={onChange}
    />
  );

const expand = () => userEvent.click(screen.getByText('Demographic questions'));

beforeEach(() => {
  mockPermissionsCustomFieldsAllowed = true;
});

describe('<DemographicSection />', () => {
  it('offers the three behaviors once expanded', async () => {
    renderSection();

    // The controls are hidden until the row is expanded.
    expect(screen.queryByText(GLOBAL_COPY)).not.toBeInTheDocument();

    await expand();

    expect(screen.getByText(GLOBAL_COPY)).toBeInTheDocument();
    expect(screen.getByText(DISABLED_COPY)).toBeInTheDocument();
    expect(screen.getByText(CUSTOM_COPY)).toBeInTheDocument();
  });

  it('emits the picked behavior', async () => {
    const onChange = jest.fn();
    renderSection({}, onChange);

    await expand();
    await userEvent.click(screen.getByText(DISABLED_COPY));

    expect(onChange).toHaveBeenCalledWith({
      custom_fields_behavior: 'disabled',
    });
  });

  describe('the question editor', () => {
    it("is shown when the behavior is 'custom'", async () => {
      renderSection({ custom_fields_behavior: 'custom' });

      await expand();

      expect(screen.getByText('FIELDS_LIST')).toBeInTheDocument();
      expect(
        screen.getByText('Add a demographic question')
      ).toBeInTheDocument();
    });

    // The other behaviors do not resolve to the permission's own questions, so
    // editing them there would have no effect.
    it.each(['global', 'disabled'] as const)(
      "is hidden when the behavior is '%s'",
      async (behavior) => {
        renderSection({ custom_fields_behavior: behavior });

        await expand();

        expect(screen.queryByText('FIELDS_LIST')).not.toBeInTheDocument();
        expect(
          screen.queryByText('Add a demographic question')
        ).not.toBeInTheDocument();
      }
    );
  });

  describe('when permissions_custom_fields is NOT allowed', () => {
    beforeEach(() => {
      mockPermissionsCustomFieldsAllowed = false;
    });

    it('still offers the two behaviors that are not part of the paid feature', async () => {
      const onChange = jest.fn();
      renderSection({ custom_fields_behavior: 'global' }, onChange);

      await expand();
      await userEvent.click(screen.getByText(DISABLED_COPY));

      expect(onChange).toHaveBeenCalledWith({
        custom_fields_behavior: 'disabled',
      });
    });

    it('locks the option that curates a list of questions', async () => {
      const onChange = jest.fn();
      renderSection({ custom_fields_behavior: 'global' }, onChange);

      await expand();
      await userEvent.click(screen.getByText(CUSTOM_COPY));

      expect(onChange).not.toHaveBeenCalled();
    });

    it('explains that the locked option is not part of the pricing plan', async () => {
      renderSection({ custom_fields_behavior: 'global' });

      await expand();
      await userEvent.hover(screen.getByText(CUSTOM_COPY));

      expect(await screen.findByText(UPSELL_COPY)).toBeInTheDocument();
    });
  });
});
