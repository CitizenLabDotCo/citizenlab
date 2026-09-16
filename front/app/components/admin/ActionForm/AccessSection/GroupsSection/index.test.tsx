import React from 'react';

import { Multiloc } from 'typings';

import { IPermissionData } from 'api/permissions/types';

import { render, screen, fireEvent, userEvent } from 'utils/testUtils/rtl';

import GroupsSection from '.';

jest.mock('hooks/useAppConfigurationLocales', () => jest.fn(() => ['en']));

jest.mock('api/groups/useGroups', () =>
  jest.fn(() => ({ data: { data: [] } }))
);

const buildPermission = (
  access_denied_explanation_multiloc: Multiloc = {}
): IPermissionData =>
  ({
    id: 'perm-1',
    type: 'permission',
    attributes: {
      action: 'commenting_idea',
      permitted_by: 'users',
      custom_fields_behavior: 'global',
      verification_expiry: null,
      access_denied_explanation_multiloc,
      everyone_tracking_enabled: false,
      user_data_collection: 'all_data',
      require_confirmed_email: true,
      confirmed_email_expiry: null,
      require_name: true,
      require_password: true,
      require_verification: false,
      permitted_by_everyone_allowed: false,
      inherited: false,
      require_confirmed_phone_number: false,
      confirmed_phone_number_expiry: null,
      verification_enabled: false,
      user_fields_in_form_descriptor: {
        value: false,
        locked: false,
        explanation: null,
      },
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    relationships: {
      permission_scope: { data: { id: 'ph-1', type: 'phase' } },
      groups: { data: [] },
    },
  } as IPermissionData);

// Opens the "Limit to groups" row and then the error message modal.
const openErrorMessageModal = async () => {
  await userEvent.click(screen.getByText('Limit to groups'));
  await userEvent.click(screen.getByText('Customize error message'));
};

const typeMessage = (message: string) =>
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: message },
  });

describe('<GroupsSection /> error message modal', () => {
  it('does not save while the message is being typed', async () => {
    const onChange = jest.fn();
    render(
      <GroupsSection permission={buildPermission()} onChange={onChange} />
    );

    await openErrorMessageModal();
    typeMessage('M');
    typeMessage('Me');
    typeMessage('Members only');

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toHaveValue('Members only');
  });

  it('saves the message once when the modal is closed', async () => {
    const onChange = jest.fn();
    render(
      <GroupsSection permission={buildPermission()} onChange={onChange} />
    );

    await openErrorMessageModal();
    typeMessage('M');
    typeMessage('Me');
    typeMessage('Members only');
    await userEvent.click(screen.getByText('Done'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      access_denied_explanation_multiloc: { en: 'Members only' },
    });
  });

  it('saves nothing when the message was not changed', async () => {
    const onChange = jest.fn();
    render(
      <GroupsSection
        permission={buildPermission({ en: 'Members only' })}
        onChange={onChange}
      />
    );

    await openErrorMessageModal();
    expect(screen.getByRole('textbox')).toHaveValue('Members only');
    await userEvent.click(screen.getByText('Done'));

    expect(onChange).not.toHaveBeenCalled();
  });
});
