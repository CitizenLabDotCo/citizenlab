// This code is a prototype for input authoring. Clean-up will follow after the prototype phase.
import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'authoring_assistance_response' };

const authoringAssistanceKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
} satisfies QueryKeys;

export default authoringAssistanceKeys;
