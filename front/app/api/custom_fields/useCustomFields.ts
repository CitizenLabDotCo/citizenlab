import { useMemo } from 'react';

import { constructFlatCustomFields } from './constructFlatCustomFields';
import { ICustomFieldsParameters } from './types';
import useRawCustomFields from './useRawCustomFields';

const useCustomFields = ({
  projectId,
  phaseId,
  inputTypes,
  copy,
  publicFields = false,
}: ICustomFieldsParameters) => {
  const result = useRawCustomFields({
    projectId,
    phaseId,
    inputTypes,
    copy,
    publicFields,
  });

  const flatCustomFields = useMemo(() => {
    if (!result.data) return undefined;
    return constructFlatCustomFields(result.data);
  }, [result.data]);

  return {
    ...result,
    data: flatCustomFields,
  };
};

export default useCustomFields;
