import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';
import {
  PermittedBy,
  UserFieldsInFormFrontendDescriptor,
} from 'api/phase_permissions/types';

export const getNumberOfVerificationLockedItems = (
  fields: IPermissionsCustomFieldData[]
) => {
  return fields.filter(({ attributes }) => attributes.lock === 'verification')
    .length;
};

export const showResetButton = (
  permittedBy: PermittedBy,
  fields: IPermissionsCustomFieldData[],
  groupIds?: string[]
) => {
  if (groupIds && groupIds.length > 0) return true;

  if (permittedBy === 'admins_moderators' || permittedBy === 'everyone') {
    return false;
  }

  return fields.some((field) => field.attributes.persisted);
};

export const allowAddingFields = (
  explanation: UserFieldsInFormFrontendDescriptor['explanation']
) => {
  return explanation !== 'with_these_settings_cannot_ask_demographic_fields';
};
