import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'survey_generation_job',
};

const surveyGenerationJobKeys = {
  all: () => [baseKey],
  list: (parameters: { phaseId: string }) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default surveyGenerationJobKeys;
