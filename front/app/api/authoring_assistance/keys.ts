import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'authoring_assistance_response' };

const authoringAssistanceKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
} satisfies QueryKeys;

export default authoringAssistanceKeys;
