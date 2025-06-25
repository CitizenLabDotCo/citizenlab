import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideaCustomFieldsKeys from './keys';
import { IIdeaCustomField, IdeaCustomFieldsKeys } from './types';

const fetch = ({
  projectId,
  phaseId,
  customFieldId,
}: {
  projectId?: string;
  phaseId?: string;
  customFieldId?: string;
}) => {
  if (projectId) {
    return fetcher<IIdeaCustomField>({
      path: `/projects/${projectId}/custom_fields/${customFieldId}`,
      action: 'get',
    });
  } else {
    return fetcher<IIdeaCustomField>({
      path: `/phases/${phaseId}/custom_fields/${customFieldId}`,
      action: 'get',
    });
  }
};

const useIdeaCustomField = ({
  projectId,
  phaseId,
  customFieldId,
}: {
  projectId?: string;
  phaseId?: string;
  customFieldId?: string;
}) => {
  return useQuery<
    IIdeaCustomField,
    CLErrors,
    IIdeaCustomField,
    IdeaCustomFieldsKeys
  >({
    queryKey: ideaCustomFieldsKeys.item({ customFieldId }),
    queryFn: () => fetch({ projectId, phaseId, customFieldId }),
    enabled: !!customFieldId,
  });
};

export default useIdeaCustomField;
