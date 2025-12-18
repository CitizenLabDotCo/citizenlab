import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'idea_exposure',
};

const ideaExposureKeys = {
  all: () => [baseKey],
} satisfies QueryKeys;

export default ideaExposureKeys;
