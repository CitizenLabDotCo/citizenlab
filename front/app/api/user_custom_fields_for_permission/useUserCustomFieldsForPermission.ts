import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';
import useCustomFieldOptionsBulk from 'api/custom_field_options/useCustomFieldOptionsBulk';
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

  const options = useCustomFieldOptionsBulk({
    customFields: result.data,
  });

  const data: IFlatCustomField[] | undefined = result.data?.data.map(
    (customField) => {
      const optionsForCustomField = options.filter((option) => {
        const relationshipOptionIds =
          customField.relationships.options.data.map((option) => option.id);

        return (
          option.data?.data.id &&
          relationshipOptionIds.includes(option.data.data.id)
        );
      });

      return {
        ...customField,
        ...customField.attributes,
        dropdown_layout: true,
        options:
          optionsForCustomField.length > 0
            ? optionsForCustomField.map((option) => ({
                id: option.data?.data.id,
                key: option.data?.data.attributes.key,
                title_multiloc:
                  option.data?.data.attributes.title_multiloc || {},
                other: option.data?.data.attributes.other || false,
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

export default useUserCustomFieldsForPermission;
