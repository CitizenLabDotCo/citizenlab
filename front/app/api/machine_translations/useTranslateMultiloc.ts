import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { ITranslatedMultiloc, ITranslateMultilocParams } from './types';

const translateMultiloc = (params: ITranslateMultilocParams) =>
  fetcher<ITranslatedMultiloc>({
    path: '/machine_translations/translate_multiloc',
    action: 'post',
    body: { machine_translation: params },
  });

// Nothing is stored, so there is nothing to invalidate.
const useTranslateMultiloc = () => {
  return useMutation<ITranslatedMultiloc, CLErrors, ITranslateMultilocParams>({
    mutationFn: translateMultiloc,
  });
};

export default useTranslateMultiloc;
