import { IPermissionsCustomFieldData } from 'api/permissions_custom_fields/types';

export const getNumberOfVerificationLockedItems = (
  fields: IPermissionsCustomFieldData[]
) => {
  return fields.filter(({ attributes }) => attributes.lock === 'verification')
    .length;
};
