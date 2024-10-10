import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';

import fetcher from 'utils/cl-react-query/fetcher';

import schemaKeys from './keys';
import { SchemaKeys, SchemaResponse } from './types';

const useCustomFieldsSchema = (
  authenticationContext: AuthenticationContext
) => {
  return useQuery<SchemaResponse, CLErrors, SchemaResponse, SchemaKeys>({
    queryKey: schemaKeys.item(authenticationContext),
    queryFn: () => fetchUserCustomFieldsSchema(authenticationContext),
  });
};

const fetchUserCustomFieldsSchema = (
  authenticationContext: AuthenticationContext
) => {
  const { type, action } = authenticationContext;

  if (type === 'global' || type === 'follow') {
    return fetcher<SchemaResponse>({
      path: `/permissions/${action}/schema`,
      action: 'get',
    });
  }

  const { id } = authenticationContext;

  if (type === 'idea') {
    return fetcher<SchemaResponse>({
      path: `/ideas/${id}/permissions/${action}/schema`,
      action: 'get',
    });
  }

  return fetcher<SchemaResponse>({
    path: `/${type}s/${id}/permissions/${action}/schema`,
    action: 'get',
  });
};

export default useCustomFieldsSchema;
