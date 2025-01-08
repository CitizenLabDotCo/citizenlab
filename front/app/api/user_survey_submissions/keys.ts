import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'user_ideas_count',
};

const userSurveySubmissionsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters) => [{ ...baseKey, operation: 'list', parameters }],
} satisfies QueryKeys;

export default userSurveySubmissionsKeys;
