import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import userCustomFieldsKeys from './keys';
import {
  IQueryParameters,
  IUserCustomFields,
  UserCustomFieldsKeys,
} from './types';

const fetch = (queryParameters?: IQueryParameters) =>
  fetcher<IUserCustomFields>({
    path: `/users/custom_fields`,
    action: 'get',
    queryParams: { input_types: queryParameters?.inputTypes },
  });

const useUserCustomFields = (queryParameters?: IQueryParameters) => {
  return useQuery<
    IUserCustomFields,
    CLErrors,
    IUserCustomFields,
    UserCustomFieldsKeys
  >({
    queryKey: userCustomFieldsKeys.list(queryParameters),
    queryFn: () => fetch(queryParameters),
  });
};

export default useUserCustomFields;
