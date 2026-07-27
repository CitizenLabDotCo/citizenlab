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
// for redaction). Used by the responses PDF and Excel exports; the flag is
// derived via an LLM call on the backend, so this can take a moment.
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
