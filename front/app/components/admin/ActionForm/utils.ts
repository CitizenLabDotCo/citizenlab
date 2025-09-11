import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';
import { PermittedBy } from 'api/phase_permissions/types';
import { UserFieldsInFormFrontendDescriptor } from 'api/phases/types';

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
  return (
    explanation !==
    'cannot_ask_demographic_fields_with_this_combination_of_permitted_by_and_anonymity'
  );
};
