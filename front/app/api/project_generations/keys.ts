import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'project_generation_job',
};

const projectGenerationJobKeys = {
  all: () => [baseKey],
  list: (parameters: { projectId: string }) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default projectGenerationJobKeys;
