// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { IPhaseData } from 'services/phases';

const getProjectPeriod = (phases: IPhaseData[] | NilOrError) => {
  if (isNilOrError(phases) || phases.length === 0) {
    return { startAt: undefined, endAt: undefined };
  }

  const startAt = phases[0].attributes.start_at;
  const endAt = phases[phases.length - 1].attributes.end_at;

  return { startAt, endAt };
};

export default getProjectPeriod;
