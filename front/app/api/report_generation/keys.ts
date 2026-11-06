import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'report_generation_job',
};

const reportGenerationKeys = {
  all: () => [baseKey],
  list: (parameters: { type: string; id: string }) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default reportGenerationKeys;
