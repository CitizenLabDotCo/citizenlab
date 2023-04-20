import { useMutation } from '@tanstack/react-query';
import { IIdeaFile } from 'api/idea_files/types';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';

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
