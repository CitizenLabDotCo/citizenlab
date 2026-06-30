import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import inputResponseFieldsKeys from './keys';
import {
  IInputResponseFields,
  IInputResponseFieldsParameters,
  InputResponseFieldsKeys,
} from './types';

// Fields exported for a phase, each flagged for personal data (pre-selected
// for redaction). Used by the survey-responses PDF export.
const useInputResponseFields = ({ phaseId }: IInputResponseFieldsParameters) =>
  useQuery<
    IInputResponseFields,
    CLErrors,
    IInputResponseFields,
    InputResponseFieldsKeys
  >({
    queryKey: inputResponseFieldsKeys.list({ phaseId }),
    queryFn: () =>
      fetcher<IInputResponseFields>({
        path: `/phases/${phaseId}/input_response_fields`,
        action: 'get',
      }),
    enabled: !!phaseId,
  });

export default useInputResponseFields;
