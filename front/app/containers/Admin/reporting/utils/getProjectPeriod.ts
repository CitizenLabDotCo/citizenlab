import moment from 'moment';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { IPhaseData } from 'services/phases';

const getProjectPeriod = (phases: IPhaseData[] | NilOrError) => {
  if (isNilOrError(phases) || phases.length === 0) {
    return { startAt: undefined, endAt: undefined };
  }

  const startMoment = moment(phases[0]?.attributes.start_at, 'YYYY-MM-DD');
  const endMoment = moment(
    phases[phases.length - 1]?.attributes.end_at,
    'YYYY-MM-DD'
  );
  const startAt = startMoment.format('LL');
  const endAt = endMoment.format('LL');

  return { startAt, endAt };
};

export default getProjectPeriod;
