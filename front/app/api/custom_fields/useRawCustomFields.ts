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
};

export const fetchCustomFields = ({
  projectId,
  phaseId,
  inputTypes,
}: Params) => {
  const apiEndpoint = phaseId
    ? `admin/phases/${phaseId}/custom_fields`
    : `admin/projects/${projectId}/custom_fields`;

  return fetcher<ICustomFields>({
    path: `/${apiEndpoint}`,
    action: 'get',
    queryParams: {
      input_types: inputTypes,
    },
  });
};

const useRawCustomFields = ({ projectId, phaseId, inputTypes }: Params) => {
  return useQuery<ICustomFields, CLErrors, ICustomFields, CustomFieldsKeys>({
    queryKey: customFieldsKeys.list({
      projectId,
      phaseId,
      inputTypes,
    }),
    queryFn: () => fetchCustomFields({ projectId, phaseId, inputTypes }),
    enabled: !!(projectId ?? phaseId),
  });
};

export default useRawCustomFields;
