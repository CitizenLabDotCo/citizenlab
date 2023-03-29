import { PermissionCustomFieldsProps } from './usePermissionsCustomFields';

const permissionsCustomFieldsKeys = {
  all: () => [{ type: 'events' }],
  lists: () => [{ ...permissionsCustomFieldsKeys.all()[0], operation: 'list' }],
  list: ({ phaseId, action }: PermissionCustomFieldsProps) => [
    { ...permissionsCustomFieldsKeys.lists()[0], phaseId, action },
  ],
  items: () => [{ ...permissionsCustomFieldsKeys.all()[0], operation: 'item' }],
  item: (id?: string) => [
    {
      ...permissionsCustomFieldsKeys.items()[0],
      id,
    },
  ],
} as const;

export default permissionsCustomFieldsKeys;
