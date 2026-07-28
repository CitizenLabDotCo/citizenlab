import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IJob } from 'api/copy_inputs/types';

import fetcher from 'utils/cl-react-query/fetcher';

import { InputPdfCover } from './generateInputResponsesPdf';
import inputResponsesPdfJobKeys from './keys';

type GenerateParams = {
  phaseId: string;
  cover: InputPdfCover;
  redactedFieldKeys: string[];
};

// Starts the background export job. If an export is already running for the
// phase, the backend reuses it instead of starting a second one. The mutation
// resolves to null (fetcher does not parse the 202 body) — the started job is
// observed via useInputResponsesPdfJob, whose query onSuccess invalidates.
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
    onSuccess: (_, { phaseId }) => {
      // Kicks the poll hook into action.
      queryClient.invalidateQueries({
        queryKey: inputResponsesPdfJobKeys.list({ phaseId }),
      });
    },
  });
};

export default useGenerateInputResponsesPdf;
