import moment from 'moment';
import { IProjectData } from './projects';
import { IPhaseData } from './phases';

type ButtonStateResponse  = {
  show: boolean;
  enabled: boolean;
};

const isCurrentPhase = (phase: IPhaseData) : boolean => {
  const currentTenantTodayMoment = moment();
  const startMoment = moment(phase.attributes.start_at, 'YYYY-MM-DD');
  const endMoment = moment(phase.attributes.end_at, 'YYYY-MM-DD');
  return currentTenantTodayMoment.isBetween(startMoment, endMoment, 'days', '[]');
};

export const postingButtonState = ({ project, phase }: {project?: IProjectData, phase?: IPhaseData}): ButtonStateResponse => {

  if (phase) {
    const inCurrentPhase = isCurrentPhase(phase);
    if (inCurrentPhase) {
      return {
        show: phase.attributes.posting_enabled,
        enabled: true,
      };
    } else { // if not in current phase
      return {
        show: phase.attributes.posting_enabled,
        enabled: false,
      };
    }
  } else if (project) { // if in known project context but unknown phase context
    return {
      show: project.attributes.posting_enabled,
      enabled: true,
    };
  } else { // If in totally unknown context
    return {
      show: true,
      enabled: true,
    };
  }
};
