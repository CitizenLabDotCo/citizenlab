import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'input_responses_pdf_job',
};

const inputResponsesPdfJobKeys = {
  all: () => [baseKey],
  list: (parameters: { phaseId: string }) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default inputResponsesPdfJobKeys;
