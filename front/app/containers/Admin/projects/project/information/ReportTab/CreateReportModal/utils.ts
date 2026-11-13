import { IPhaseData } from 'api/phases/types';
import { PHASE_REPORT_TEMPLATE_METHODS } from 'api/reports/constants';

import { pastPresentOrFuture } from 'utils/dateUtils';

export const PARTICIPATION_METHODS = PHASE_REPORT_TEMPLATE_METHODS;

export const findInitialPhase = (phases: IPhaseData[]) => {
  for (const phase of phases) {
    const isPastOrOngoing =
      pastPresentOrFuture(phase.attributes.start_at) !== 'future';

    if (
      isPastOrOngoing &&
      PARTICIPATION_METHODS.includes(phase.attributes.participation_method)
    ) {
      return phase.id;
    }
  }

  return undefined;
};
