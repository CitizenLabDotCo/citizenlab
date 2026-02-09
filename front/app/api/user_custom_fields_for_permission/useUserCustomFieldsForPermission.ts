import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';
import customFieldOptionsKeys from 'api/custom_field_options/keys';
import { ICustomFields, IFlatCustomField } from 'api/custom_fields/types';

import fetcher from 'utils/cl-react-query/fetcher';

import userCustomFieldsForPermissionKeys from './keys';
import { UserCustomFieldsForPermission } from './types';

const useUserCustomFieldsForPermission = (
  authenticationContext: AuthenticationContext
) => {
  const result = useQuery<
    ICustomFields,
    CLErrors,
    ICustomFields,
    UserCustomFieldsForPermission
  >({
    queryKey: userCustomFieldsForPermissionKeys.item(authenticationContext),
    queryFn: () => fetchUserPermissionsCustomFields(authenticationContext),
  });

  const { data: optionsResponse } = useQuery({
    queryKey: customFieldOptionsKeys.list({ authenticationContext }),
    queryFn: () => fetchUserPermissionCustomFieldOptions(authenticationContext),
  });

  const options = optionsResponse?.data ?? [];

  const data: IFlatCustomField[] | undefined = result.data?.data.map(
    (customField) => {
      const optionsForCustomField = options.filter((option) => {
        const options = customField.relationships.options?.data ?? [];
        const relationshipOptionIds = options.map((option) => option.id);

        return option.id && relationshipOptionIds.includes(option.id);
      });

      return {
        ...customField,
        ...customField.attributes,
        dropdown_layout: true,
        options:
          optionsForCustomField.length > 0
            ? optionsForCustomField.map((option) => ({
                id: option.id,
                key: option.attributes.key,
                title_multiloc: (option.attributes.title_multiloc as any) || {},
                other: option.attributes.other || false,
              }))
            : [],
      };
    }
  );

  return { ...result, data };
};

const fetchUserPermissionsCustomFields = (
  authenticationContext: AuthenticationContext
) => {
  const { type, action } = authenticationContext;

  if (type === 'global' || type === 'follow') {
    return fetcher<ICustomFields>({
      path: `/permissions/${action}/custom_fields`,
      action: 'get',
    });
  }

  const { id } = authenticationContext;

  if (type === 'idea') {
    return fetcher<ICustomFields>({
      path: `/ideas/${id}/permissions/${action}/custom_fields`,
      action: 'get',
    });
  }

  return fetcher<ICustomFields>({
    path: `/${type}s/${id}/permissions/${action}/custom_fields`,
    action: 'get',
  });
};

const fetchUserPermissionCustomFieldOptions = (
  authenticationContext: AuthenticationContext
) => {
  const { type, action } = authenticationContext;

  if (type === 'global' || type === 'follow') {
    return fetcher<ICustomFields>({
      path: `/permissions/${action}/custom_field_options`,
      action: 'get',
    });
  }

  const { id } = authenticationContext;

  if (type === 'idea') {
    return fetcher<ICustomFields>({
      path: `/ideas/${id}/permissions/${action}/custom_field_options`,
      action: 'get',
    });
  }

  return fetcher<ICustomFields>({
    path: `/${type}s/${id}/permissions/${action}/custom_field_options`,
    action: 'get',
  });
};

export default useUserCustomFieldsForPermission;
