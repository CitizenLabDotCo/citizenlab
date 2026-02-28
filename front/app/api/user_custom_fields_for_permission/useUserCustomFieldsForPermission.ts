import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';
import { constructFlatCustomFields } from 'api/custom_fields/constructFlatCustomFields';
import { ICustomFields } from 'api/custom_fields/types';

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

  const data = useMemo(() => {
    if (!result.data) return undefined;
    const flatFields = constructFlatCustomFields(result.data);
    // Registration fields always use dropdown layout
    return flatFields?.map((field) => ({
      ...field,
      dropdown_layout: true,
    }));
  }, [result.data]);

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
