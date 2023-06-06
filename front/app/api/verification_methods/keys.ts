import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'verification_method' };

const verificationMethodsKeys = {
  all: () => [baseKey],
} satisfies QueryKeys;

export default verificationMethodsKeys;
