import { IPhaseData } from 'api/phases/types';

const getProjectPeriod = (phases: IPhaseData[]) => {
  const startAt = phases[0].attributes.start_at;
  const endAt = phases[phases.length - 1].attributes.end_at;

  return { startAt, endAt };
};

export default getProjectPeriod;
