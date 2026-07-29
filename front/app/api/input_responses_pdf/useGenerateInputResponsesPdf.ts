import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IJob } from 'api/jobs/types';

import fetcher from 'utils/cl-react-query/fetcher';

import inputResponsesPdfJobKeys from './keys';
import { InputPdfCover } from './types';

type GenerateParams = {
  phaseId: string;
  cover: InputPdfCover;
  redactedFieldKeys: string[];
};

// Starts the background export job (409 if one is already running). Resolves
// to null (fetcher does not parse 202 bodies); track via useInputResponsesPdfJob.
const generateInputResponsesPdf = ({
  phaseId,
  cover,
  redactedFieldKeys,
}: GenerateParams) =>
  fetcher<IJob>({
    path: `/phases/${phaseId}/input_responses_pdf`,
    action: 'post',
    body: {
      cover: {
        include: cover.include,
        title: cover.title,
        subtitle: cover.subtitle,
        date: cover.date,
        prepared_by: cover.preparedBy,
        notes: cover.notes,
      },
      redacted_field_keys: redactedFieldKeys,
    },
  });

const useGenerateInputResponsesPdf = () => {
  const queryClient = useQueryClient();

  return useMutation<IJob, CLErrors, GenerateParams>({
    mutationFn: generateInputResponsesPdf,
    onSettled: (_data, _error, { phaseId }) => {
      // Kicks the poll into action — also on a 409, to show the running job.
      queryClient.invalidateQueries({
        queryKey: inputResponsesPdfJobKeys.list({ phaseId }),
      });
    },
  });
};

export default useGenerateInputResponsesPdf;
