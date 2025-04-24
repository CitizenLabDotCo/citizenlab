import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'community_monitor',
};

const communityMonitorKeys = {
  all: () => [baseKey],
} satisfies QueryKeys;

export default communityMonitorKeys;
