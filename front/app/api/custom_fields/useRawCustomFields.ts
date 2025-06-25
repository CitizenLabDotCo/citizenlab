import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customFieldsKeys from './keys';
import {
  ICustomFields,
  ICustomFieldInputType,
  CustomFieldsKeys,
} from './types';

type Params = {
  projectId?: string;
  phaseId?: string;
  inputTypes?: ICustomFieldInputType[];
  copy?: boolean;
};

export const fetchCustomFields = ({
  projectId,
  phaseId,
  inputTypes,
  copy,
}: Params) => {
  const apiEndpoint = phaseId
    ? `phases/${phaseId}/custom_fields`
    : `projects/${projectId}/custom_fields`;

  return fetcher<ICustomFields>({
    path: `/${apiEndpoint}`,
    action: 'get',
    queryParams: {
      input_types: inputTypes,
      copy,
    },
  });
};

const useRawCustomFields = ({
  projectId,
  phaseId,
  inputTypes,
  copy,
}: Params) => {
  return useQuery<ICustomFields, CLErrors, ICustomFields, CustomFieldsKeys>({
    queryKey: customFieldsKeys.list({
      projectId,
      phaseId,
      inputTypes,
      copy,
    }),
    queryFn: () => fetchCustomFields({ projectId, phaseId, inputTypes, copy }),
    enabled: !!(projectId ?? phaseId),
  });
};

export default useRawCustomFields;
