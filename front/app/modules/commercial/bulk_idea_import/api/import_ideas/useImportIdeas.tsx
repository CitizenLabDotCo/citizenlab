import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { IIdeaFile } from 'api/idea_files/types';

const importIdeas = async (base64: string) =>
  fetcher<IIdeaFile>({
    path: `/import_ideas/bulk_create_xlsx`,
    action: 'post',
    body: { import_ideas: { xlsx: base64 } },
  });

const useImportIdeas = () => {
  return useMutation<IIdeaFile, CLErrors, string>({
    mutationFn: importIdeas,
  });
};

export default useImportIdeas;
